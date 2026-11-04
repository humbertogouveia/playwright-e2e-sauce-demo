import {Page,Locator} from '@playwright/test'
import { BasePage } from './basePage'

export class HomePage extends BasePage {
    readonly tituloHome:Locator;
    readonly linkTextSignup: Locator;

    constructor(page:Page) {
        super(page);

        this.tituloHome = page.getByRole('heading',{name:'Sauce Demo'});
        this.linkTextSignup = page.getByRole('link',{name:'Sign up'})
    }

    async acessarSignup(){
        await this.linkTextSignup.click()
    }
}