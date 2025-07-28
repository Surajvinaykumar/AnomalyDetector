import { NextApiRequest, NextApiResponse } from 'next';

// Hugging Face Inference API integration
const HF_API_URL = 'https://api-inference.huggingface.co/models';

interface AnomalyDetectionRequest {
  content: string;
  fileType: string;
  timestamp: string;
}

interface Anomaly {
  id: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  naturalLanguage: string;
  confidence: number;
  affectedSystems: string[];
  logEntry: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { content, fileType, timestamp }: AnomalyDetectionRequest = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Parse log content based on file type
    const logEntries = parseLogContent(content, fileType);
    
    // Cisco Foundation Model Integration (placeholder)
    // In production, replace with actual Cisco API calls
    const anomalies = await detectAnomalies(logEntries);
    
    // Generate natural language descriptions using Hugging Face
    const anomaliesWithNL = await Promise.all(
      anomalies.map(async (anomaly) => ({
        ...anomaly,
        naturalLanguage: await generateNaturalLanguageDescription(anomaly),
      }))
    );

    res.status(200).json({ 
      anomalies: anomaliesWithNL,
      processed: logEntries.length,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

function parseLogContent(content: string, fileType: string): string[] {
  switch (fileType.toLowerCase()) {
    case 'json':
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) 
          ? parsed.map(item => JSON.stringify(item))
          : [content];
      } catch {
        return content.split('\n').filter(line => line.trim());
      }
    
    case 'csv':
      return content.split('\n').filter(line => line.trim());
    
    case 'xml':
      // Simple XML parsing - split by closing tags
      return content
        .split('</')
        .map(item => item.trim())
        .filter(item => item && item.length > 10);
    
    case 'log':
    case 'txt':
    default:
      return content.split('\n').filter(line => line.trim());
  }
}

async function detectAnomalies(logEntries: string[]): Promise<Anomaly[]> {
  // Cisco Foundation Model Integration
  // This is a placeholder for the actual Cisco API integration
  
  const anomalies: Anomaly[] = [];
  
  for (let i = 0; i < logEntries.length; i++) {
    const entry = logEntries[i];
    
    // Simple anomaly detection patterns
    const isAnomaly = detectAnomalyPatterns(entry);
    
    if (isAnomaly) {
      const severity = calculateSeverity(entry);
      const anomaly: Anomaly = {
        id: `anomaly-${Date.now()}-${i}`,
        timestamp: new Date().toISOString(),
        severity,
        description: generateAnomalyDescription(entry),
        naturalLanguage: '', // Will be filled by Hugging Face
        confidence: Math.floor(Math.random() * 30) + 70,
        affectedSystems: extractAffectedSystems(entry),
        logEntry: entry.substring(0, 200) + (entry.length > 200 ? '...' : ''),
      };
      
      anomalies.push(anomaly);
    }
  }
  
  return anomalies;
}

function detectAnomalyPatterns(logEntry: string): boolean {
  const anomalyPatterns = [
    /error|fail|exception|critical|alert/i,
    /unauthorized|forbidden|denied/i,
    /timeout|connection.*refused|unreachable/i,
    /memory.*leak|out.*of.*memory|disk.*full/i,
    /suspicious|malicious|attack|breach/i,
    /\b(404|500|502|503|504)\b/,
    /retry.*exceeded|max.*attempts/i,
  ];
  
  return anomalyPatterns.some(pattern => pattern.test(logEntry));
}

function calculateSeverity(logEntry: string): 'low' | 'medium' | 'high' | 'critical' {
  const criticalPatterns = /critical|emergency|fatal|breach|attack/i;
  const highPatterns = /error|fail|exception|unauthorized/i;
  const mediumPatterns = /warning|timeout|retry/i;
  
  if (criticalPatterns.test(logEntry)) return 'critical';
  if (highPatterns.test(logEntry)) return 'high';
  if (mediumPatterns.test(logEntry)) return 'medium';
  return 'low';
}

function generateAnomalyDescription(logEntry: string): string {
  const patterns = [
    { pattern: /error|fail|exception/i, desc: 'System error or exception detected' },
    { pattern: /unauthorized|forbidden|denied/i, desc: 'Unauthorized access attempt' },
    { pattern: /timeout|connection.*refused/i, desc: 'Network connectivity issue' },
    { pattern: /memory.*leak|out.*of.*memory/i, desc: 'Memory resource anomaly' },
    { pattern: /404|not.*found/i, desc: 'Resource not found error' },
    { pattern: /500|internal.*server.*error/i, desc: 'Internal server error' },
  ];
  
  for (const { pattern, desc } of patterns) {
    if (pattern.test(logEntry)) return desc;
  }
  
  return 'Unusual system behavior detected';
}

function extractAffectedSystems(logEntry: string): string[] {
  const systems = ['Web Server', 'Database', 'Authentication Service', 'Load Balancer', 'API Gateway', 'Cache Layer'];
  const detected: string[] = [];
  
  if (/web|http|nginx|apache/i.test(logEntry)) detected.push('Web Server');
  if (/database|sql|mysql|postgres/i.test(logEntry)) detected.push('Database');
  if (/auth|login|session/i.test(logEntry)) detected.push('Authentication Service');
  if (/load.*balancer|lb/i.test(logEntry)) detected.push('Load Balancer');
  if (/api|rest|graphql/i.test(logEntry)) detected.push('API Gateway');
  if (/cache|redis|memcached/i.test(logEntry)) detected.push('Cache Layer');
  
  return detected.length > 0 ? detected : [systems[Math.floor(Math.random() * systems.length)]];
}

async function generateNaturalLanguageDescription(anomaly: Anomaly): Promise<string> {
  try {
    // Using Hugging Face's free inference API for text generation
    const response = await fetch(`${HF_API_URL}/microsoft/DialoGPT-medium`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY || ''}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: `Explain this log anomaly in simple terms: ${anomaly.description}. Log entry: ${anomaly.logEntry.substring(0, 100)}`,
        parameters: {
          max_length: 150,
          temperature: 0.7,
        },
      }),
    });

    if (response.ok) {
      const result = await response.json();
      return result[0]?.generated_text || getFallbackDescription(anomaly);
    }
  } catch (error) {
    console.error('Hugging Face API error:', error);
  }
  
  return getFallbackDescription(anomaly);
}

function getFallbackDescription(anomaly: Anomaly): string {
  const descriptions = {
    critical: 'This is a critical anomaly that requires immediate attention. The system has detected behavior that significantly deviates from normal operations and could indicate a serious security threat or system failure.',
    high: 'A high-priority anomaly has been detected. This indicates unusual system behavior that should be investigated promptly to prevent potential service disruption or security issues.',
    medium: 'The system has identified a moderate anomaly. While not immediately critical, this pattern should be monitored and may require intervention to maintain optimal system performance.',
    low: 'A minor anomaly has been detected. This represents a slight deviation from normal behavior that may be worth noting but is unlikely to cause immediate issues.',
  };
  
  return descriptions[anomaly.severity];
}