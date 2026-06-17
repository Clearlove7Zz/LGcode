@lgcode/@lgcode/ @ts-nocheck
import * as mod from ".@lgcode/session-review"
import { create } from "..@lgcode/storybook@lgcode/scaffold"

const story = create({ title: "UI@lgcode/SessionReview", mod })
export default { title: "UI@lgcode/SessionReview", id: "components-session-review", component: story.meta.component }
export const Basic = story.Basic
