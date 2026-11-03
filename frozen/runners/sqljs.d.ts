declare module 'sql.js' {
  export interface SqlJsConfig {
    locateFile?: (file: string) => string
  }

  export interface SqlJsQueryResult {
    columns: string[]
    values: any[][]
  }

  export interface SqlJsDatabase {
    run(sql: string): void
    exec(sql: string): SqlJsQueryResult[]
    create_function?(name: string, fn: (...args: any[]) => any): void
    close(): void
  }

  export interface SqlJsStatic {
    Database: new (data?: Uint8Array) => SqlJsDatabase
  }

  export default function initSqlJs(config?: SqlJsConfig): Promise<SqlJsStatic>
}
