import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  const encoded = await tokenizer("hello world", {
    padding: "max_length",
    truncation: true,
    max_length: 32,
  });
  
  console.log(encoded.input_ids);
}

main().catch(console.error);
