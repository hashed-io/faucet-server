class BaseDao {
  constructor ({
    dbConn,
    tableName,
    tableAlias
  }) {
    this.dbConn = dbConn
    this.tableName = tableName
    this.tableAlias = tableAlias
    this.table = `${this.tableName} ${this.tableAlias}`
  }

  async totalCount () {
    return this.dbConn.singleValue(`SELECT COUNT(*) FROM ${this.tableName}`)
  }

  async truncate () {
    await this.dbConn.query(`TRUNCATE ${this.tableName}`)
  }

  async deleteAll (dbConn = null) {
    dbConn = dbConn || this.dbConn
    await dbConn
      .query(`DELETE FROM ${this.tableName}`)
  }
}

module.exports = BaseDao
