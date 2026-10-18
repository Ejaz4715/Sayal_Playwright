import fs from 'fs';
import path from 'path';

export class DataHelper {
  /**
   * Resolves the full file path given a relative or absolute file name/path
   */
  private static getFilePath(fileName: string): string {
    const jsonFileName = fileName.endsWith('.json') ? fileName : `${fileName}.json`;
    return path.isAbsolute(jsonFileName) ? jsonFileName : path.resolve(process.cwd(), 'src/data', jsonFileName);
  }

  /**
   * Reads fresh JSON data from disk
   */
  static readData(fileName: string = 'test-data.json'): any {
    const filePath = this.getFilePath(fileName);
    if (!fs.existsSync(filePath)) {
      return {};
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return rawData.trim() ? JSON.parse(rawData) : {};
  }

  // =========================================================================
  // Overload Signatures (Declares allowed method signatures for Intellisense)
  // =========================================================================

  /** Updates key-value pair in default 'test-data.json' */
  static updateServiceData(serviceName: string, key: string, value: any): void;

  /** Updates key-value pair in a specific JSON file */
  static updateServiceData(fileName: string, serviceName: string, key: string, value: any): void;

  // =========================================================================
  // Implementation Signature (Handles both signature calls)
  // =========================================================================
  static updateServiceData(...args: any[]): void {
    let fileName = 'test-data.json';
    let serviceName: string;
    let key: string;
    let value: any;

    if (args.length === 4) {
      [fileName, serviceName, key, value] = args;
    } else {
      [serviceName, key, value] = args;
    }

    const filePath = this.getFilePath(fileName);
    const currentData = this.readData(fileName);

    // Ensure the services block exists
    if (!currentData.services) {
      currentData.services = {};
    }

    // Ensure the specific service entry exists
    if (!currentData.services[serviceName]) {
      currentData.services[serviceName] = {};
    }

    // Update or insert value
    currentData.services[serviceName][key] = value;

    // Write back to disk
    fs.writeFileSync(filePath, JSON.stringify(currentData, null, 2), 'utf-8');
  }
}
