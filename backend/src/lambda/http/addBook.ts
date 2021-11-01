import 'source-map-support/register'

import {APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult} from 'aws-lambda'
import {BooksService} from "../../booksService";
import {AddBookRequest} from "../../requests/AddBookRequest";
import {getUserId} from "../utils";

const booksService = new BooksService()

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const newBookData: AddBookRequest = JSON.parse(event.body)
    const userId: string = getUserId(event)
    return {
        statusCode: 201,
        headers: {
            'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
            item: await booksService.addNew(newBookData, userId)
        })
    }
}
