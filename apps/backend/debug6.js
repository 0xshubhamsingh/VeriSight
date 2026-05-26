import { AutoTokenizer } from "@xenova/transformers";

async function main() {
  const tokenizer = await AutoTokenizer.from_pretrained("bert-base-uncased");
  
  try {
    const r1 = await tokenizer("hello world", {
      padding: true,
      truncation: true,
      max_length: 32,
    });
    console.log("R1 Success (padding: true)");
  } catch(e) { console.log("R1 Failed", e.message); }

  try {
    const r2 = await tokenizer("hello world", {
      padding: "max_length",
      truncation: true,
      max_length: 32,
    });
    console.log("R2 Success (padding: max_length)");
  } catch(e) { console.log("R2 Failed", e.message); }
  
  try {
    const r3 = await tokenizer("hello world", {
      padding: "max_length",
      truncation: true,
      max_length: 32,
      return_tensor: false,
    });
    console.log("R3 Success (typo return_tensor)");
  } catch(e) { console.log("R3 Failed", e.message); }
}

main().catch(console.error);
