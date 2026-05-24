declare module "onnxruntime-web" {
  export type DataType = "float32" | "int32" | "int64" | "bool" | "uint8";

  export class Tensor {
    constructor(type: DataType, data: ArrayLike<number | bigint | boolean>, dims: number[]);
    readonly type: DataType;
    readonly data: Float32Array | Int32Array | BigInt64Array | Uint8Array | boolean[];
    readonly dims: number[];
  }

  export interface SessionRunOptions {
    readonly logSeverityLevel?: number;
    readonly logVerbosityLevel?: number;
  }

  export interface InferenceSession {
    run(
      feeds: Record<string, Tensor>,
      options?: SessionRunOptions,
    ): Promise<Record<string, Tensor | undefined>>;
  }

  export namespace InferenceSession {
    function create(
      modelPath: string,
      options?: {
        executionProviders?: string[];
      },
    ): Promise<InferenceSession>;
  }
}
