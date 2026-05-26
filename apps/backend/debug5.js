import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  const encoded = await tokenizer("hello world", {
    padding: "max_length",
    truncation: true,
    max_length: 32,
    return_tensor: false, // typo intentionally
  });
  
  console.log("Success!");
  console.log("input_ids is array?", Array.isArray(encoded.input_ids));
  console.log("data:", encoded.input_ids.data ? "exists" : "undefined");
}

main().catch(console.error);
