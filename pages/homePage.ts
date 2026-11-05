import {Page,Locator,expect} from '@playwright/test'
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
        await this.page.goto('/account/register')
        await expect(this.page).toHaveTitle('Create Account – Sauce Demo')
    }
}