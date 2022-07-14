import React, {
  ChangeEvent,
  KeyboardEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import ReactDOM from 'react-dom';
import randomSeed from 'random-seed';

interface Dictionary {
  [i: string]: readonly string[];
}

const MATCHES_WORD = /\b[\w']+\b/g;
const MATCHES_UPPERCASE = /[A-Z]+/;
const MATCHES_LOWERCASE = /[a-z]+/;

const CONTRACTION_MAP = {
  "i'd": 'I would',
  "i'll": 'I will',
  "i've": 'I have',
  "i'm": 'I am',
  "she'd": 'she would',
  "she's": 'she is',
  "she'll": 'she will',
  "he'd": 'he would',
  "he's": 'he is',
  "he'll": 'he will',
  "they'll": 'they will',
  "they're": 'they are',
  "they've": 'they have',
  "we'd": 'we would',
  "we're": 'we are',
  "we'll": 'we will',
  "we've": 'we have',
  "it'll": 'it will',
  "it's": 'is it',
  "it'd": 'is would',
  "that's": 'that is',
  "there's": 'there is',
  "where's": 'where is',
  "here's": 'here is',
  "let's": 'let us',
  "can't": 'cannot',
  "didn't": 'did not',
  "doesn't": 'does not',
  "don't": 'do not',
  "hadn't": 'had not',
  "hasn't": 'has not',
  "isn't": 'is not',
  "wasn't": 'was not',
  "won't": 'will not',
  "couldn't": 'could not',
  "shouldn't": 'should not',
  "wouldn't": 'would not',
  "could've": 'could have',
  "would've": 'would have',
  "should've": 'should have',
  "might've": 'might have',
  "must've": 'must have',
  "who's": 'who is',
  "'tis": 'it is',
  "'twas": 'it was',
  "you'll": 'you will',
  "'n": 'and',
  "'n'": 'and',
  "n'": 'and',
  "why'd": 'why did',
  "why's": 'why is',
  "how's": 'how is',
};

const SLANG_CONTRACTION_MAP = {
  wanna: 'want to',
  gonna: 'going to',
  gotta: 'got to',
  kinda: 'kind of',
  outta: 'out of',
  gimme: 'give me',
  hafta: 'have to',
  lemme: 'let me',
  init: 'is it not',
  neva: 'never',
  u: 'you',
  r: 'are',
  ur: 'you are',
  im: 'i am',
  b: 'be',
  bb: 'baby',
  bae: 'baby',
  kl: 'cool',
  klkl: 'cool cool',
  lol: 'laugh out loud',
  nah: 'no',
  na: 'no',
};

const CUSTOM_OVERRIDES = {
  never: 'at no time',
};

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

const swapWord = (
  word: string,
  random: randomSeed.RandomSeed,
  dictionary: Dictionary
) => {
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
};

const kirstify = (text: string, dictionary: Dictionary) => {
  const trimmed = text.trim();
  const random = randomSeed.create(trimmed);

  return trimmed
    .split('\n')
    .map((line) =>
      line.trim().replace(MATCHES_WORD, (word) => {
        const lower = word.toLowerCase();

        if (lower in CONTRACTION_MAP) {
          return retainCase(
            word,
            CONTRACTION_MAP[lower as keyof typeof CONTRACTION_MAP]
          ).replace(MATCHES_WORD, (subWord) =>
            swapWord(subWord, random, dictionary)
          );
        }

        if (lower in SLANG_CONTRACTION_MAP) {
          return retainCase(
            word,
            SLANG_CONTRACTION_MAP[lower as keyof typeof SLANG_CONTRACTION_MAP]
          ).replace(MATCHES_WORD, (subWord) =>
            swapWord(subWord, random, dictionary)
          );
        }

        if (lower in CUSTOM_OVERRIDES) {
          return retainCase(
            word,
            CUSTOM_OVERRIDES[lower as keyof typeof CUSTOM_OVERRIDES]
          ).replace(MATCHES_WORD, (subWord) =>
            swapWord(subWord, random, dictionary)
          );
        }

        return swapWord(word, random, dictionary);
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

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.metaKey && (event.key === 'Enter' || event.keyCode === 13)) {
        if (dictionary) {
          setOutput(kirstify(text, dictionary));
        }
      }
    },
    [dictionary, text]
  );

  const onClick = useCallback(() => {
    if (dictionary) {
      setOutput(kirstify(text, dictionary));
    }
  }, [dictionary, text]);

  return (
    <main>
      <h1>Kirstify</h1>
      <p>
        Hold you e'er wished you could arrange together letter condemnation view
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
            onKeyDown={onKeyDown}
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
