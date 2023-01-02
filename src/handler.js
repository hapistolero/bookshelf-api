
const { nanoid } = require('nanoid')
const books = require('./books')

const addBookHandler = (request, h) => {
  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload

  const id = nanoid(16)
  const insertedAt = new Date().toISOString()
  const updatedAt = insertedAt
  let finished = false

  if (request.payload.pageCount === request.payload.readPage) {
    finished = true
  }

  const newBooks = {
    name, year, author, summary, publisher, pageCount, readPage, reading, id, insertedAt, updatedAt, finished
  }

  if (newBooks.name !== undefined && newBooks.readPage <= newBooks.pageCount) {
    books.push(newBooks)
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id
      }
    })
    response.header('Access-Control-Allow-Origin', '*')
    response.code(201)
    return response
  } else if (newBooks.name === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku'
    })
    response.header('Access-Control-Allow-Origin', '*')
    response.code(400)
    return response
  } else if (newBooks.readPage > newBooks.pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
    })
    response.header('Access-Control-Allow-Origin', '*')
    response.code(400)
    return response
  }

  const response = h.response({
    status: 'error',
    message: 'Buku gagal ditambahkan'
  })
  response.code(500)
  return response
}

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query

  if (name !== undefined) {
    const bookFiltered = books.filter((n) => n.name.toLowerCase().includes(name.toLowerCase()))
    if (bookFiltered) {
      return {
        status: 'success',
        data: {
          books: bookFiltered.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }
      }
    } else {
      const response = h.response({
        status: 'fail',
        message: 'Buku Tidak Ditemukan'
      })
      response.code(404)
      return response
    }
  } else if (reading !== undefined) {
    if (reading === '1') {
      const readedBooks = books.filter((n) => n.reading === true)
      return {
        status: 'success',
        data: {
          books: readedBooks.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }

      }
    } else if (reading === '0') {
      const unreadBooks = books.filter((n) => n.reading === false)
      return {
        status: 'success',
        data: {
          books: unreadBooks.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }
      }
    } else {
      return {
        status: 'success',
        data: {
          books: books.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }
      }
    }
  } else if (finished !== undefined) {
    if (finished === '1') {
      const finishedBooks = books.filter((n) => n.finished === true)
      return {
        status: 'success',
        data: {
          books: finishedBooks.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }

      }
    } else if (finished === '0') {
      const unfinishedBooks = books.filter((n) => n.finished === false)
      return {
        status: 'success',
        data: {
          books: unfinishedBooks.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }
      }
    } else {
      return {
        status: 'success',
        data: {
          books: books.map(({ id, name, publisher }) => ({ id, name, publisher }))
        }
      }
    }
  } else {
    return {
      status: 'success',
      data: {
        books: books.map(({ id, name, publisher }) => ({ id, name, publisher }))
      }
    }
  }
}

const getBooksByIdHandler = (request, h) => {
  const { bookId } = request.params

  //   const { name, reading, finished } = request.query

  const book = books.filter((book) => book.id === bookId)[0]

  if (book !== undefined && book.id !== undefined) {
    return {
      status: 'success',
      data: {
        book
      }
    }
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan'
  })
  response.code(404)
  return response
}

const editBooksByIdHandler = (request, h) => {
  const { bookId } = request.params

  const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload
  const updatedAt = new Date().toISOString()

  const index = books.findIndex((book) => book.id === bookId)

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt
    }
    if (books[index].name === undefined) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. Mohon isi nama buku'
      })
      response.code(400)
      return response
    } else if (books[index].readPage > books[index].pageCount) {
      const response = h.response({
        status: 'fail',
        message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
      })
      response.code(400)
      return response
    } else {
      const response = h.response({
        status: 'success',
        message: 'Buku berhasil diperbarui'
      })
      response.code(200)
      return response
    }
  } else {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan'
    })
    response.code(404)
    return response
  }
}

const deleteBooksByIdHandler = (request, h) => {
  const { id } = request.params

  const index = books.findIndex((book) => book.id === id)

  if (index !== -1) {
    books.splice(index, 1)
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus'
    })

    response.code(200)
    return response
  } else {
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan'
    })
    response.code(404)
    return response
  }
}

const getBookByNameHandler = (request, h) => {
  const { name } = request.query

  const book = books.filter((n) => n.name.toLowerCase() === name.toLowerCase())[0].book.map(({ id, name, publisher }) => ({ id, name, publisher }))
  if (book !== undefined) {
    return {
      status: 'success',
      data: {
        books: book
      }
    }
  }
  const response = h.response({
    status: 'fail',
    message: 'Buku Tidak Ditemukan' + book
  })
  response.code(404)
  return response
}

const getBooksByReadingHandler = (request) => {
  const { reading } = request.query
  if (reading === '1') {
    return {
      status: 'success',
      data: {
        books: books.filter((n) => n.reading === true).n.map(({ id, name, publisher }) => ({ id, name, publisher }))
      }

    }
  } else if (reading === '0') {
    const book = books.filter((n) => n.reading === false)
    return {
      status: 'success',
      data: {
        books: book.map(({ id, name, publisher }) => ({ id, name, publisher }))
      }
    }
  } else {
    return {
      status: 'success',
      data: {
        books
      }
    }
  }
}

const getBooksByFinishedHandler = (request) => {
  const { finished } = request.query
  if (finished === '1') {
    const book = books.filter((n) => n.finished === true)
    return {
      status: 'success',
      data: {
        book: book.map(({ id, name, publisher }) => ({ id, name, publisher }))
      }

    }
  } else if (finished === '0') {
    const book = books.filter((n) => n.finished === false)
    return {
      status: 'success',
      data: {
        book: book.map(({ id, name, publisher }) => ({ id, name, publisher }))
      }
    }
  } else {
    return {
      status: 'success',
      data: {
        book: books.map(({ id, name, publisher }) => ({ id, name, publisher }))
      }
    }
  }
}

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBooksByIdHandler,
  editBooksByIdHandler,
  deleteBooksByIdHandler,
  getBookByNameHandler,
  getBooksByReadingHandler,
  getBooksByFinishedHandler
}
