import axios from 'axios';

export const EXTRACTION_ENDPOINTS = [
  'http://localhost:8080/api/documents/upload-pdf',
];

const extractTextFromNode = (node, seen = new Set()) => {
  if (!node || seen.has(node)) return '';
  if (typeof node === 'string') return node.trim();

  if (Array.isArray(node)) {
    for (const item of node) {
      const found = extractTextFromNode(item, seen);
      if (found) return found;
    }
    return '';
  }

  if (typeof node !== 'object') {
    return '';
  }

  seen.add(node);

  const priorityKeys = [
    'extractedText',
    'originalText',
    'maskedText',
    'text',
    'content',
    'documentText',
    'extractedContent',
  ];

  for (const key of priorityKeys) {
    const value = node[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  for (const [key, value] of Object.entries(node)) {
    if (typeof value === 'string' && /text|content|masked|original/i.test(key) && value.trim()) {
      return value.trim();
    }
  }

  for (const value of Object.values(node)) {
    const found = extractTextFromNode(value, seen);
    if (found) return found;
  }

  return '';
};

export const resolveExtractedText = (session) => {
  if (!session) return '';
  return extractTextFromNode(session);
};

export const callExtractionApi = async (file, token) => {
  let lastError = null;

  for (const url of EXTRACTION_ENDPOINTS) {
    const extractionData = new FormData();
    extractionData.append('file', file);

    try {
      return await axios.post(url, extractionData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Extraction API call failed.');
};

export const fetchTemplateFileForExtraction = async (template, token) => {
  const response = await axios.get(`http://localhost:8080/api/templates/${template.id}/view`, {
    responseType: 'blob',
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined,
  });

  const mimeType = response.data?.type || 'application/pdf';
  const fallbackName = template?.name || `template-${template?.id || Date.now()}.pdf`;
  const fileName = /\.[a-z0-9]+$/i.test(fallbackName) ? fallbackName : `${fallbackName}.pdf`;

  return new File([response.data], fileName, { type: mimeType });
};
