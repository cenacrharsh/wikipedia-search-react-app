import { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("Programming");
  const [suggestions, setSuggestions] = useState([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // Debounce the API call and delay it for 500ms
  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(timerId);
    };
  }, [searchTerm]);

  // Call API to get search results
  useEffect(() => {
    if (!debouncedSearchTerm) {
      setSuggestions([]);
      return;
    }

    const apiUrl = `https://en.wikipedia.org/w/api.php?action=opensearch&origin=*&search=${debouncedSearchTerm}`;

    axios
      .get(apiUrl)
      .then((response) => {
        const data = response.data;
        /*
        data: ['Cat', Array(10), Array(10), Array(10)]
        0:  "Cat"
        1:  ['Cat', 'Catholic Church']
        2:  ['', '']
        3:  [
            'https://en.wikipedia.org/wiki/Cat',
            'https://en.wikipedia.org/wiki/Catholic_Church'
            ]
        */
        setSuggestions(
          data[1].map((title, index) => ({
            title,
            link: data[3][index],
          }))
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }, [debouncedSearchTerm]);

  // remove search results after 200ms delay
  useEffect(() => {
    let timerId;
    if (!debouncedSearchTerm) {
      timerId = setTimeout(() => {
        setSuggestions([]);
      }, 200);
    } else {
      clearTimeout(timerId);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [debouncedSearchTerm]);

  function handleChange(event) {
    setSearchTerm(event.target.value);
  }

  return (
    <div>
      <input
        type="text"
        data-testid="searchterm"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Enter Search Text"
      />
      <ul>
        {suggestions.map((suggestion) => (
          <li key={suggestion.link}>
            <a
              href={suggestion.link}
              data-testid="suggestion"
              target="_blank"
              rel="noreferrer"
            >
              {suggestion.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Search;

/*
If you type again before waiting 500ms for the API to make a request, then the previous request will be cancelled and a new request will be triggered after another 500ms delay with the latest search term entered. This behavior is implemented to avoid sending too many requests to the API and to save network resources. By introducing the delay, the API is only called when the user has finished typing, rather than on every keypress.

In this code, the delay is implemented using two useEffect hooks.

The first useEffect hook updates debouncedSearchTerm with the latest value of searchTerm after a 500ms delay. The delay is implemented using the setTimeout function.

The second useEffect hook fetches data from the Wikipedia API using the debouncedSearchTerm value. This hook only runs when the debouncedSearchTerm value changes. The debouncedSearchTerm value is updated with a delay of 500ms after the searchTerm value changes, which is what allows us to debounce the API requests.

In the code, the useEffect hook that sets the debounced search term has a cleanup function that uses clearTimeout to clear any previous setTimeout instances.

The cleanup function is returned from the hook and is executed whenever the component is re-rendered with a different searchTerm. This ensures that only one setTimeout instance is active at any time, which cancels any previous instances if they exist.
*/
