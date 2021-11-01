import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import * as AWS from 'aws-sdk'
import { Book } from './models/Book'
import { UpdateBookRequest } from './requests/UpdateBookRequest'
import { S3 } from 'aws-sdk/clients/browser_default'

const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

export class BooksCloudManager {
  constructor(
    private readonly dynamodb: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly s3: S3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly booksTable: string = process.env.BOOKS_TABLE,
    private readonly index: string = process.env.USER_ID_ADDED_AT_INDEX,
    private readonly attachmentsBucket: string = process.env.BOOK_IMAGES_S3_BUCKET
  ) {
  }

  async saveBook(book: Book) {
    await this.dynamodb.put({
      TableName: this.booksTable,
      Item: book
    }).promise()
  }

  async updateBook(bookId: string, userId: string, updateBookData: UpdateBookRequest) {
    await this.dynamodb.update({
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId
      },
      UpdateExpression: 'set #theTitle = :t, read = :r',
      ExpressionAttributeValues: {
        ':t': updateBookData.title,
        ':r': updateBookData.read
      },
      ExpressionAttributeNames: {
        '#theTitle': 'title'
      }
    }).promise()
  }

  async addBookAttachment(bookId: string, userId: string) {
    await this.dynamodb.update({
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId
      },
      UpdateExpression: 'set attachmentUrl = :url',
      ExpressionAttributeValues: {
        ':url': `https://${process.env.BOOK_IMAGES_S3_BUCKET}.s3.amazonaws.com/${bookId}`
      }
    }).promise()
  }

  async deleteBook(bookId: string, userId: string) {
    await this.dynamodb.delete({
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId
      }
    }).promise()
  }

  async findBook(bookId: string, userId: string): Promise<Book> | undefined {
    const result = await this.dynamodb.get({
      TableName: this.booksTable,
      Key: {
        userId: userId,
        bookId: bookId
      }
    }).promise()

    if (result.Item) {
      return result.Item as Book
    }

    return undefined
  }


  async getBooks(userId: string) {
    const result = await this.dynamodb.query({
      TableName: this.booksTable,
      IndexName: this.index,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    })
      .promise()

    return result.Items
  }

  getUploadUrlForBook(bookId: string) {
    return this.s3.getSignedUrl('putObject', {
      Bucket: this.attachmentsBucket,
      Key: bookId,
      Expires: 300
    })
  }
}