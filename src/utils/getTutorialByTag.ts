import type { CollectionEntry } from "astro:content";
import getSortedTutorial from "./getSortedTutorial";
import { slugifyAll } from "./slugify";

const getTutorialByTag = (posts: CollectionEntry<"tutorial">[], tag: string) =>
getSortedTutorial(
    posts.filter(post => slugifyAll(post.data.tags).includes(tag))
  );

export default getTutorialByTag;
