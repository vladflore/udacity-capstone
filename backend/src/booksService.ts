import * as uuid from 'uuid'
import { AddBookRequest } from './requests/AddBookRequest'
import { BooksCloudManager } from './booksCloudManager'
import { Book } from './models/Book'
import { UpdateBookRequest } from './requests/UpdateBookRequest'
import { createLogger } from './utils/logger'

const booksCloudManager = new BooksCloudManager()
const logger = createLogger('books-mngmnt-service')

export class BooksService {
  async addNew(newBookData: AddBookRequest, userId: string) {
    const newBook: Book = {
      userId: userId,
      bookId: uuid.v4(),
      addedAt: new Date().toISOString(),
      ...newBookData,
      isRead: false
    }
    await booksCloudManager.saveBook(newBook)
    logger.info(`User ${userId} added a new book with id: ${newBook.bookId}.`)
    delete newBook['userId']
    return newBook
  }

  async delete(bookId: string, userId: string) {
    const book = await booksCloudManager.findBook(bookId, userId)
    if (book) {
      await booksCloudManager.deleteBook(bookId, userId)
      logger.info(`User ${userId} deleted book with id: ${bookId}.`)
      return book
    }
    return undefined
  }

  async createAttachment(bookId: string, userId: string) {
    const book = await booksCloudManager.findBook(bookId, userId)
    if (book) {
      await booksCloudManager.addBookAttachment(bookId, userId)
      logger.info(`User ${userId} added attachment for book with id: ${bookId}.`)
      return booksCloudManager.getUploadUrlForBook(bookId)
    }
    return undefined
  }

  async findAll(userId: string) {
    logger.info(`User ${userId} requested all books.`)
    return await booksCloudManager.getBooks(userId)
  }

  async update(bookId: string, updateBookData: UpdateBookRequest, userId: string) {
    const oldBook = await booksCloudManager.findBook(bookId, userId)
    if (oldBook) {
      await booksCloudManager.updateBook(bookId, userId, updateBookData)
      logger.info(`User ${userId} updated book with id: ${bookId}`)
      return oldBook
    }
    return undefined
  }
}