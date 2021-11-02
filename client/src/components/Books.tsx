import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import { Button, Checkbox, Divider, Grid, Header, Icon, Image, Input, Loader } from 'semantic-ui-react'

import { addBook, deleteBook, getBooks, patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  loadingBooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    loadingBooks: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  onEditButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }

  onBookAdd = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const newBook = await addBook(this.props.auth.getIdToken(), {
        title: this.state.newBookName
      })
      this.setState({
        books: [...this.state.books, newBook],
        newBookName: ''
      })
    } catch {
      alert('Book add failed')
    }
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId !== bookId)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  onBookCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        title: book.title,
        isRead: !book.isRead
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { isRead: { $set: !book.isRead } }
        })
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books: books,
        loadingBooks: false
      })
    } catch (e) {
      // @ts-ignore
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as='h1'>Books</Header>

        {this.renderCreateBookInput()}

        {this.renderBooks()}
      </div>
    )
  }

  renderCreateBookInput() {
    return (
      <Grid.Row>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New book',
              onClick: this.onBookAdd
            }}
            fluid
            actionPosition='left'
            placeholder='Enter the title of a book...'
            onChange={this.handleNameChange}
          />
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline='centered'>
          Loading Books
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={1} verticalAlign='middle'>
                <Checkbox
                  onChange={() => this.onBookCheck(pos)}
                  checked={book.isRead}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign='middle'>
                {book.title}
              </Grid.Column>
              {/*<Grid.Column width={3} floated='right'>*/}
              {/*  {book.dueDate}*/}
              {/*</Grid.Column>*/}
              <Grid.Column width={1} floated='right'>
                <Button
                  icon
                  color='blue'
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name='pencil' />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated='right'>
                <Button
                  icon
                  color='red'
                  onClick={() => this.onBookDelete(book.bookId)}
                >
                  <Icon name='delete' />
                </Button>
              </Grid.Column>
              {book.attachmentUrl && (
                <Image src={book.attachmentUrl} size='small' wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }
}
