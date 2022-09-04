const { Util } = require('../util')

class DBRequestProvider {
  async query (sql, params) {
    const { rows } = await this.client().query(sql, params)
    return rows
  }

  async singleRow (...args) {
    const rows = await this.query(...args)
    return (rows && rows.length) ? rows[0] : null
  }

  async singleValue (...args) {
    const row = await this.singleRow(...args)
    return row ? Object.values(row)[0] : null
  }

  async singleValueArray (...args) {
    const rows = await this.query(...args)
    return rows.map((row) => Object.values(row)[0])
  }

  async keyValueMap ({
    statement,
    key,
    value,
    params,
    toValueArray = false
  }) {
    // console.log(`In keyValueMap query: ${statement}, params: ${JSON.stringify(params, null, 4)}`)
    const rows = await this.query(statement, params)
    // console.log('rows: ', rows)
    return Util.toKeyValue(rows, key, value, toValueArray)
  }

  async truncate (tableName) {
    await this.query(`TRUNCATE TABLE ${tableName}`)
  }

  async count ({
    from,
    where = '',
    params = {}
  }) {
    const query = `
      SELECT count(*)
      FROM ${from}
      ${where}
    `
    return this.singleValue(query, params)
  }

  async search (
    {
      selectCols,
      from,
      where,
      params,
      orderBy,
      determinisiticSortField,
      desc,
      offset,
      limit
    }
  ) {
    where = where || ''
    orderBy = `${Util.toUnderscoreCase(orderBy)} ${desc ? 'desc' : 'asc'}`
    offset = offset || 0
    limit = limit || 10

    if (determinisiticSortField) {
      orderBy = `${orderBy}, ${determinisiticSortField}`
    }

    const query = `
      SELECT 
        ${selectCols}
      FROM ${from} 
      ${where}
      ORDER BY ${orderBy}
      LIMIT ${limit}
      OFFSET ${offset};
    `

    // console.log(`In search query: ${query}, params: ${JSON.stringify(params, null, 4)}`)
    const rows = await this.query(
      query,
      params
    )
    let more = false
    if (rows.length <= limit) {
      const count = await this.count({
        from,
        where,
        params
      })
      more = count > offset + limit
    }
    return {
      rows,
      more
    }
  }

  async client () {
    throw Error('client method must be overriden by child class')
  }
}

module.exports = DBRequestProvider
