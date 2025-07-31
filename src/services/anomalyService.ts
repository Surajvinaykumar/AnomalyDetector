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

class AnomalyService {
  private apiEndpoint = '/api/detect-anomalies';

  async detectAnomalies(content: string, fileType: string) {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          fileType,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json() as { anomalies: Anomaly[] };
      return result.anomalies;
    } catch (error) {
      console.error('Error detecting anomalies:', error);
      throw error;
    }
  }

  // Mock data for development - replace with actual API integration
  async mockDetectAnomalies(content: string, fileType: string) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Parse content based on file type
    const logEntries = this.parseLogContent(content, fileType);
    
    // Mock anomaly detection
    const anomalies = logEntries
      .filter(() => Math.random() > 0.7) // Randomly select entries as anomalies
      .map((entry, index) => ({
        id: `anomaly-${index}`,
        timestamp: new Date().toISOString(),
        severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
        description: this.generateAnomalyDescription(entry),
        naturalLanguage: this.generateNaturalLanguageDescription(entry),
        confidence: Math.floor(Math.random() * 30) + 70,
        affectedSystems: this.extractAffectedSystems(entry),
        logEntry: entry,
      }));

    return anomalies;
  }

  private parseLogContent(content: string, fileType: string): string[] {
    switch (fileType.toLowerCase()) {
      case 'json':
        try {
          const parsed = JSON.parse(content);
          return Array.isArray(parsed) ? parsed.map(item => JSON.stringify(item)) : [content];
        } catch {
          return [content];
        }
      case 'csv':
        return content.split('\n').filter(line => line.trim());
      case 'xml':
        return content.split('</').map(item => item.trim()).filter(item => item);
      default:
        return content.split('\n').filter(line => line.trim());
    }
  }

  private generateAnomalyDescription(logEntry: string): string {
    const patterns = [
      'Unusual network traffic pattern detected',
      'Authentication failure spike observed',
      'Resource consumption anomaly',
      'Error rate exceeds normal thresholds',
      'Suspicious user behavior pattern',
      'System performance degradation',
      'Security policy violation detected',
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private generateNaturalLanguageDescription(logEntry: string): string {
    const descriptions = [
      'The system has detected an unusual spike in network traffic that deviates significantly from normal patterns. This could indicate a potential DDoS attack or unusual system behavior that requires immediate attention.',
      'Multiple failed authentication attempts have been detected from various IP addresses, suggesting a possible brute force attack or credential stuffing attempt against user accounts.',
      'System resources are being consumed at an abnormally high rate, which may indicate a memory leak, inefficient processes, or potential malicious activity affecting system performance.',
      'The error rate has exceeded normal operational thresholds, indicating potential system instability or configuration issues that may impact service availability.',
      'Suspicious user behavior has been identified, including unusual access patterns or attempts to access restricted resources outside of normal business hours.',
    ];
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  private extractAffectedSystems(logEntry: string): string[] {
    const systems = ['Web Server', 'Database', 'Authentication Service', 'Load Balancer', 'API Gateway', 'Cache Layer'];
    return systems.slice(0, Math.floor(Math.random() * 3) + 1);
  }
}

export const anomalyService = new AnomalyService();