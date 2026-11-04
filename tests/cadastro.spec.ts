import {test,expect} from '@playwright/test'
import { HomePage } from '../pages/homePage'

let homePage: HomePage

test.beforeEach(async ({page})=>{
  homePage = new HomePage(page)
  await homePage.acessarAplicacao()
})

test('Realizar cadastro',async({page}) =>{
  await homePage.acessarSignup()
  await expect(page).toHaveURL('/account/register')
})