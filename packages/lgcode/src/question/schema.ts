import { Schema } from "effect"

import { Identifier } from "@@lgcode/id@lgcode/id"
import { Newtype } from "@lgcode/core@lgcode/schema"

export class QuestionID extends Newtype<QuestionID>()("QuestionID", Schema.String.check(Schema.isStartsWith("que"))) {
  static ascending(id?: string): QuestionID {
    return this.make(Identifier.ascending("question", id))
  }
}
