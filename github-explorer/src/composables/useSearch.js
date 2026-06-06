import { ref, computed } from "vue";
import { searchRepos } from "../api/git";

const MAX_CACHE_SIZE = 50;

export function useSearch() {
  const query = ref("");
  const repos = ref([]);
  const page = ref(1);
  const loading = ref(false);
  const error = ref(null);
  const hasMore = ref(true);
  const sortBy = ref("stars");
  const language = ref("");
  const hasSearched = ref(false);
  const cache = new Map();
  let repoIds = new Set();

  let timeout = null;
  let currentRequestId = 0;

  const search = async (reset = true) => {
    const trimmed = query.value.trim();

    if (!trimmed) {
      repos.value = [];
      hasSearched.value = false;
      return;
    }

    loading.value = true;
    error.value = null;
    hasSearched.value = true;

    const requestId = ++currentRequestId;

    try {
      if (reset) {
        page.value = 1;
        repos.value = [];
        repoIds = new Set();
        hasMore.value = true;
        cache.clear();
      }

      const cacheKey = `${trimmed}-${page.value}-${sortBy.value}-${language.value}`;

      if (cache.has(cacheKey)) {
        const cached = cache.get(cacheKey);
        cached.forEach((repo) => {
          if (!repoIds.has(repo.id)) {
            repos.value.push(repo);
            repoIds.add(repo.id);
          }
        });
        loading.value = false;
        return;
      }

      const data = await searchRepos(encodeURIComponent(trimmed), page.value);

      if (requestId !== currentRequestId) return;

      if (!data.items || data.items.length === 0) {
        hasMore.value = false;
        return;
      }

      const newRepos = [];
      data.items.forEach((repo) => {
        if (!repoIds.has(repo.id)) {
          repoIds.add(repo.id);
          repos.value.push(repo);
          newRepos.push(repo);
        }
      });

      if (cache.size >= MAX_CACHE_SIZE) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      cache.set(cacheKey, newRepos);

      if (repos.value.length >= data.total_count) {
        hasMore.value = false;
      }
    } catch (err) {
      error.value = err?.message || "Something went wrong";
    } finally {
      loading.value = false;
    }
  };

  const debounceSearch = () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      search(true);
    }, 500);
  };

  const loadMore = async () => {
    if (!hasMore.value || loading.value) return;
    page.value++;
    await search(false);
  };

  const filteredRepos = computed(() => {
    let result = repos.value;

    if (language.value) {
      result = result.filter((r) => r.language === language.value);
    }

    return [...result].sort((a, b) => {
      return sortBy.value === "stars"
        ? b.stargazers_count - a.stargazers_count
        : new Date(b.updated_at) - new Date(a.updated_at);
    });
  });

  const isEmptySearch = computed(
    () => hasSearched.value && repos.value.length === 0
  );

  const isFilteredOut = computed(
    () =>
      hasSearched.value &&
      repos.value.length > 0 &&
      filteredRepos.value.length === 0
  );

  return {
    query,
    repos: filteredRepos,
    loading,
    error,
    hasMore,
    sortBy,
    language,
    hasSearched,
    isEmptySearch,
    isFilteredOut,
    loadMore,
    search,
    debounceSearch,
  };
}
