'use client';

import { useState } from 'react';
import { createClarifaiAPI } from '../api/clarifai';
import { ClarifaiConfig, ClarifaiConcept } from '../../types/clarifai';

interface ClarifaiConceptCreatorProps {
  config: ClarifaiConfig;
}

export const ClarifaiConceptCreator = ({ config }: ClarifaiConceptCreatorProps) => {
  const [conceptId, setConceptId] = useState('');
  const [conceptName, setConceptName] = useState('');
  const [result, setResult] = useState<ClarifaiConcept | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    try {
      const clarifai = createClarifaiAPI(config);
      const response = await clarifai.createConcept(conceptId, conceptName);
      setResult(response.data.concepts[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="conceptId" className="block text-sm font-medium">
            Concept ID
          </label>
          <input
            id="conceptId"
            type="text"
            value={conceptId}
            onChange={(e) => setConceptId(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <div>
          <label htmlFor="conceptName" className="block text-sm font-medium">
            Concept Name
          </label>
          <input
            id="conceptName"
            type="text"
            value={conceptName}
            onChange={(e) => setConceptName(e.target.value)}
            className="mt-1 block w-full rounded border border-gray-300 px-3 py-2"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Create Concept
        </button>
      </form>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {result && (
        <div className="mt-4 p-3 bg-green-100 text-green-700 rounded">
          <h3 className="font-medium">Concept Created:</h3>
          <p>ID: {result.id}</p>
          <p>Name: {result.name}</p>
        </div>
      )}
    </div>
  );
};
