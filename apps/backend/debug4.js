import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  const encoded = await tokenizer("hello world", {
    padding: true,
    truncation: true,
    max_length: 32,
    return_tensor: false,
  });
  
  console.log(encoded.input_ids);
}

main().catch(console.error);
