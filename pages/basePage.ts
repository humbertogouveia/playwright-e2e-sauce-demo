import {Page} from '@playwright/test'

export class BasePage {
    constructor(protected readonly  page:Page) {}

    async acessarAplicacao() {
        await this.page.goto('/')
    }
}