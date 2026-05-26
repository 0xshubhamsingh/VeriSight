import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  console.log("Loading tokenizer...");
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  const text1 = "New federal law bans AI tools from every office job";
  const encoded1 = await tokenizer(text1, {
    padding: "max_length",
    truncation: true,
    max_length: 32,
  });
  
  console.log("Encoded 1 input_ids:", encoded1.input_ids);
}

main().catch(console.error);
