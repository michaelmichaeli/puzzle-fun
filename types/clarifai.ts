export interface ClarifaiUserAppId {
  user_id: string;
  app_id: string;
}

export interface ClarifaiConfig {
  userId: string;
  appId: string;
  pat: string;
}

export interface ClarifaiImageInput {
  data: {
    image: {
      url?: string;
      base64?: string;
    };
  };
}

export interface ClarifaiPredictionRequest {
  user_app_id: ClarifaiUserAppId;
  inputs: ClarifaiImageInput[];
}

export interface ClarifaiPrediction {
  data: {
    concepts: Array<{
      id: string;
      name: string;
      value: number;
    }>;
  };
}

export interface ClarifaiResponse<T> {
  status: {
    code: number;
    description: string;
  };
  outputs: T[];
}
