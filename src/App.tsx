import "./index.css";
import React, { useEffect, useMemo, useRef } from "react";
import ReactDOM from "react-dom/client";
import { useState } from "react";
import debounce from "lodash.debounce";
import InfiniteScroll from "react-infinite-scroller";
import {
  BrowserRouter,
  Outlet,
  Route,
  Routes,
  useLoaderData,
  useSearchParams,
} from "react-router-dom";

type searchresponse = {
  more: boolean;
  query: string;
  items: { object_id: string; path: string }[];
};
async function searchDb(
  skip = 0,
  limit = 10,
  query: string
): Promise<searchresponse> {
  if (query == "") {
    return { more: false, items: [], query: query };
  }
  const equery = encodeURIComponent(query);
  const resp = await fetch(
    `http://localhost:6680/search_text?limit=${limit}&skip=${skip}&query=${equery}`
  );
  if (resp.status != 200) {
    return { more: false, items: [], query: query };
  }
  const result = await resp.json();
  result.query = query;
  return result;
}
const pagesize = 20;

function InfiniteSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  const loaded: searchresponse = useLoaderData();
  const [results, setResults] = useState<searchresponse>(loaded);
  if (results.query != loaded.query) {
    setResults(loaded);
  }
  console.log("results", results);

  async function loadMore(page = 0) {
    const newres = { ...results };
    const res = await searchDb(newres.items.length, pagesize, newres.query);
    newres.items = newres.items.concat(res.items);
    setResults(newres);
  }
  function findNear(object_id: string) {
    return (_e) => {
      setSearchParams((params) => {
        params.set("query", `@"${object_id}"`);
        return params;
      });
    };
  }
  function opener(url: string) {
    return (_e) => {
      window.electronAPI.openFile(url);
    };
  }
  const query = searchParams.get("query") || "";
  return (
    <div className="">
      <div className="">
        <div className="">
          <InfiniteScroll
            pageStart={0}
            loadMore={loadMore}
            hasMore={results.more}
            initialLoad={false}
            loader={
              <div className="loader" key={0}>
                Loading ...
              </div>
            }
          >
            {results.items.map((o) => (
              <div key={o.object_id} className="inline-block max-h-80 relative">
                <button
                  className="absolute border right-0 w-7 h-7 rounded-sm p-1 text-white bg-gray-600 bg-opacity-40"
                  onClick={findNear(o.object_id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-fit h-fit"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                </button>
                <button
                  className="absolute border right-0 w-7 h-7 top-8 rounded-sm p-1 text-white bg-gray-600 bg-opacity-40"
                  onClick={opener(o.path)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-fit h-fit"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                    />
                  </svg>
                </button>
                <img
                  src={o.path}
                  draggable={true}
                  onDragStart={(event) => {
                    event.preventDefault();
                    window.electronAPI.startDrag(o.path);
                  }}
                  className="hover:cursor-grab max-h-80"
                />
              </div>
            ))}
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}

export async function searchLoader({ request }): Promise<searchresponse> {
  const rqurl: URL = new URL(request.url);
  return await searchDb(0, pagesize, rqurl.searchParams.get("query"));
}

export function SearchBar() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("query") || "";

  function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    1;
    setSearchParams((params) => {
      params.set("query", e.target.value);
      return params;
    });
  }
  return (
    <div className="flex border rounded">
      <div className="flex-none w-12 text-gray-500 bg-blue-200 font-bold text-center">
        <label>Sort</label>
      </div>
      <div className="flex-grow">
        <input
          type="text"
          value={query}
          className="block w-full px-4 py-2 text-blue-700 bg-white border rounded-md"
          placeholder="Search..."
          onChange={handleSearch}
        />
      </div>
    </div>
  );
}

export function App() {
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("query") || "";

  return (
    <div>
      <SearchBar />
      <InfiniteSearch />
    </div>
  );
}
