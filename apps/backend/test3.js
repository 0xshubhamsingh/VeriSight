import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  const encoded = await tokenizer("hello world", {
    padding: "max_length",
    truncation: true,
    max_length: 256,
    return_tensor: false,
  });
  
  console.log("Success! Length:", encoded.input_ids.length);
  console.log("First 5:", encoded.input_ids.slice(0, 5));
  console.log("Last 5:", encoded.input_ids.slice(251, 256));
}

main().catch(console.error);
