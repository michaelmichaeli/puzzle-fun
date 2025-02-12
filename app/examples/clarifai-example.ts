import { createClarifaiAPI } from '../api/clarifai';

const CLARIFAI_CONFIG = {
  userId: process.env.NEXT_PUBLIC_CLARIFAI_USER_ID || '',
  appId: process.env.NEXT_PUBLIC_CLARIFAI_APP_ID || '',
  pat: process.env.NEXT_PUBLIC_CLARIFAI_PAT || ''
};

export const createConcept = async () => {
  const clarifai = createClarifaiAPI(CLARIFAI_CONFIG);

  try {
    const response = await clarifai.createConcept('cat', 'Cat Name');
    console.log('Concept created:', response.data.concepts[0]);
    return response.data.concepts[0];
  } catch (error) {
    console.error('Error creating concept:', error);
    throw error;
  }
};
