import React, { ChangeEvent, useCallback, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import randomSeed from 'random-seed';

interface Dictionary {
  [i: string]: readonly string[];
}

const MATCHES_WORD = /\b[\w']+\b/g;
const MATCHES_UPPERCASE = /[A-Z]+/;
const MATCHES_LOWERCASE = /[a-z]+/;

const retainCase = (original: string, replacement: string) => {
  const originalFirst = original.charAt(0);
  const replacementFirst = replacement.charAt(0);

  if (original.toUpperCase() === original) {
    return replacement.toUpperCase();
  }

  if (original.toLowerCase() === original) {
    return replacement.toLowerCase();
  }

  if (
    MATCHES_UPPERCASE.test(originalFirst) &&
    MATCHES_LOWERCASE.test(replacementFirst)
  ) {
    return `${replacementFirst.toUpperCase()}${replacement.substring(1)}`;
  }

  if (
    MATCHES_LOWERCASE.test(originalFirst) &&
    MATCHES_UPPERCASE.test(replacementFirst)
  ) {
    return `${replacementFirst.toLowerCase()}${replacement.substring(1)}`;
  }

  return replacement;
};

const kirstify = (text: string, dictionary: Dictionary) => {
  const trimmed = text.trim();
  const random = randomSeed.create(trimmed);

  return trimmed
    .split('\n')
    .map((line) =>
      line.trim().replace(MATCHES_WORD, (word) => {
        if (word.length <= 2) {
          return word;
        }

        const matches = dictionary[word.toLowerCase()];

        if (!matches) {
          return word;
        }

        const alternatives = matches.filter(
          (alt) => !alt.includes(' ') && alt.length >= word.length
        );

        if (!alternatives.length) {
          return word;
        }

        const newWord = alternatives[random.range(alternatives.length)];

        if (!newWord) {
          return word;
        }

        return retainCase(word, newWord);
      })
    )
    .join('\n');
};

const App = () => {
  const [dictionary, setDictionary] = useState<Dictionary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [output, setOutput] = useState<string | null>(null);

  useEffect(() => {
    fetch('./dictionary.json')
      .then((response) => {
        if (response.ok) {
          return response.json();
        }

        return Promise.reject('Failed to get Kirstinesses');
      })
      .then((json: Dictionary) => {
        setDictionary(json);
      })
      .catch((err) => {
        setError((err && err.toString()) || 'Something went wrong');
      });
  }, []);

  const onChange = useCallback((event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.currentTarget.value);
  }, []);

  const onClick = useCallback(() => {
    if (dictionary) {
      setOutput(kirstify(text, dictionary));
    }
  }, [text, dictionary]);

  return (
    <main>
      <h1>Kirstify</h1>
      <p>
        Hold you e'er wished you could arrange togehter letter condemnation view
        Kirsty?
      </p>
      <p>Forthwith you lavatory!</p>
      {!dictionary && !error && <p>Preparing Kirstinesses...</p>}
      {error && <p className="error">{error}</p>}
      {dictionary && (
        <>
          <textarea
            value={text}
            onChange={onChange}
            placeholder="Enter some text to Kirstify..."
          ></textarea>
          <button onClick={onClick}>Kirstify!</button>
          {!!output && <div className="output">{output}</div>}
        </>
      )}
      <h2>What are people saying about Kirstify?</h2>
      <blockquote>
        <p>
          So casually he presenteth me with what I can only assess as to be one
          of, if not the uppermost defining moments of my heretowith life.
        </p>
        <p>I feel seen.</p>
        <footer>- Kirsty</footer>
      </blockquote>
    </main>
  );
};

ReactDOM.render(<App />, document.getElementById('app'));
