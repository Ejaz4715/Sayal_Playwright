import fs from 'fs';
import path from 'path';

const dataFilePath = path.resolve(process.cwd(), 'src/data/test-data.json');

export class DataHelper {
  /**
   * Reads fresh JSON data from disk
   */
  static readData(): any {
    const rawData = fs.readFileSync(dataFilePath, 'utf-8');
    return JSON.parse(rawData);
  }

  /**
   * Updates an existing key or creates a new key-value pair in test-data.json
   * 
   * @param serviceName - Target service (e.g., 'login', 'booking')
   * @param key - Field key to update or insert
   * @param value - New value to set
   */
  static updateServiceData(serviceName: string, key: string, value: any): void {
    const currentData = this.readData();

    // Ensure the services block exists
    if (!currentData.services) {
      currentData.services = {};
    }

    // Ensure the specific service entry exists
    if (!currentData.services[serviceName]) {
      currentData.services[serviceName] = {};
    }

    // Updates value if key exists, or creates a new key-value pair if absent
    currentData.services[serviceName][key] = value;

    // Write updated JSON back to disk with formatted 2-space indentation
    fs.writeFileSync(dataFilePath, JSON.stringify(currentData, null, 2), 'utf-8');
  }
}