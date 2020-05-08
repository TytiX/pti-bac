import { Params } from "@feathersjs/feathers";
import { Datas } from "../models/datas";
import { Category } from "../models/category";

export class CategoryService {
  db: Datas;

  constructor(db: Datas) {
    this.db = db;
  }

  async find(param: Params) {
    if (param.query && param.query.random) {
      let types = param.query.types || ['classic', 'original', 'hard', 'fun'];
      if (types.length === 0) types = ['classic', 'original', 'hard', 'fun'];
      // console.log(types);
      const filtered = this.db.getCategories().filter((c: { name: string; type: string }) => {
        return types.indexOf(c.type) >= 0;
      });
      // console.log(filtered);
      const list = filtered.map((c: { name: string }, i: number) => {
        return { id: i, name: c.name };
      });
      const selectedCategories: Category[] = [];
      for (let count = 0; count < param.query.random; count++) {
        const [category, index] = this.getRandomCategory(list);
        list.splice(index, 1);
        selectedCategories.push(category);
      }
      return selectedCategories;
    } else {
      return this.db.getCategories().map((c: { name: string }, i: number) => {
        return {
          id: i,
          name: c.name
        }
      });
    }
  }

  getRandomCategory(list: Category[]): [Category, number] {
    const index = Math.floor(Math.random() * list.length);
    return [list[index], index];
  }
}
