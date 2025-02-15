import {
  ClarifaiConfig,
  ClarifaiPredictionRequest,
  ClarifaiResponse,
  ClarifaiPrediction,
} from "../../types/clarifai";

export class ClarifaiAPI {
  private config: ClarifaiConfig;
  private baseUrl = "https://api.clarifai.com/v2";
  private defaultUserApp = {
    user_id: "clarifai",
    app_id: "main",
  };

  constructor(config: ClarifaiConfig) {
    this.config = config;
  }

  private async makeRequest<T>(
    endpoint: string,
    method: string,
    body?: object,
  ): Promise<T> {
    const requestOptions: RequestInit = {
      method,
      headers: {
        Accept: "application/json",
        Authorization: `Key ${this.config.pat}`,
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, requestOptions);

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.statusText}`);
    }

    return response.json();
  }

  async predictImage(
    imageData: string,
    modelId: string,
    modelVersionId?: string,
  ): Promise<ClarifaiResponse<ClarifaiPrediction>> {
    const isBase64 = imageData.startsWith("data:image");
    const base64Data = isBase64 ? imageData.split("base64,")[1] : imageData;

    const requestBody: ClarifaiPredictionRequest = {
      user_app_id: this.defaultUserApp,
      inputs: [
        {
          data: {
            image: {
              base64: base64Data,
            },
          },
        },
      ],
    };

    const endpoint = modelVersionId
      ? `/models/${modelId}/versions/${modelVersionId}/outputs`
      : `/models/${modelId}/outputs`;

    return this.makeRequest(endpoint, "POST", requestBody);
  }
}

export const createClarifaiAPI = (config: ClarifaiConfig) =>
  new ClarifaiAPI(config);
