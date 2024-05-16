import { slugifyStr } from "./slugify";
import type { CollectionEntry } from "astro:content";
import tutorialFilter from "./tutorialFilter";

interface Tag {
  tag: string;
  tagName: string;
}

const getUniqueTutorialTags = (posts: CollectionEntry<"tutorial">[]) => {
  const tags: Tag[] = posts
    .filter(tutorialFilter)
    .flatMap(post => post.data.tags)
    .map(tag => ({ tag: slugifyStr(tag), tagName: tag }))
    .filter(
      (value, index, self) =>
        self.findIndex(tag => tag.tag === value.tag) === index
    )
    .sort((tagA, tagB) => tagA.tag.localeCompare(tagB.tag));
  return tags;
};

export default getUniqueTutorialTags;
