interface ErrorLog {
  timestamp: number;
  error: string;
  context: any;
}

export class ErrorMonitor {
  private static errorLogs: ErrorLog[] = [];
  private static readonly MAX_LOGS = 100;

  static logError(error: Error, context: any = {}) {
    const errorLog: ErrorLog = {
      timestamp: Date.now(),
      error: error.message,
      context
    };

    this.errorLogs.unshift(errorLog);
    if (this.errorLogs.length > this.MAX_LOGS) {
      this.errorLogs.pop();
    }

    console.error('Search Error:', {
      message: error.message,
      context,
      timestamp: new Date().toISOString()
    });
  }

  static getErrorStats() {
    const now = Date.now();
    const lastHour = this.errorLogs.filter(log => now - log.timestamp < 3600000);
    
    return {
      total: this.errorLogs.length,
      lastHour: lastHour.length,
      rateLimitErrors: lastHour.filter(log => log.error.includes('rate limit')).length,
      apiErrors: lastHour.filter(log => log.error.includes('API')).length
    };
  }
}