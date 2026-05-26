import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  // With typo "return_tensor"
  const encoded = await tokenizer("hello world", {
    padding: true,
    truncation: true,
    max_length: 32,
    return_tensor: false,
  });
  
  console.log("Is array?", Array.isArray(encoded.input_ids));
  console.log("Array.from length:", Array.from(encoded.input_ids).length);
  console.log("Keys:", Object.keys(encoded.input_ids));
}

main().catch(console.error);
