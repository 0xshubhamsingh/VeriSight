import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  try {
    const encoded = await tokenizer("test", {
      padding: true,
      truncation: true,
      max_length: 256,
      return_tensor: false,
    });
    console.log("SUCCESS");
  } catch (err) {
    console.error("CRASH:", err.message);
  }
}

main().catch(console.error);
