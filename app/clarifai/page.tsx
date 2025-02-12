import { ClarifaiConceptCreator } from '../components/ClarifaiConceptCreator';

const ClarifaiPage = () => {
  const config = {
    userId: process.env.NEXT_PUBLIC_CLARIFAI_USER_ID || '',
    appId: process.env.NEXT_PUBLIC_CLARIFAI_APP_ID || '',
    pat: process.env.NEXT_PUBLIC_CLARIFAI_PAT || ''
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">
        Clarifai Concept Creator
      </h1>
      <ClarifaiConceptCreator config={config} />
    </div>
  );
};

export default ClarifaiPage;
