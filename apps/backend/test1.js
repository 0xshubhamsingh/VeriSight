import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  try {
    const encoded = await tokenizer("test", {
      padding: true,
      truncation: true,
      max_length: 256,
    });
    console.log("SUCCESS:", encoded.input_ids.data.length);
  } catch (err) {
    console.error("CRASH 1:", err.message);
  }
}

main().catch(console.error);
