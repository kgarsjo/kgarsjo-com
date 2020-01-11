import React, { Fragment } from 'react';
import { css, injectGlobal } from 'emotion';

injectGlobal`
html, body {
    background-color: #222;
    color: #eee;
}

noscript {
    background-color: #a42f2f;
    display: block;
    margin: 1em 0;
    padding: 1em;
}

a:link { color: #b8f5f0; }
a:visited { color: #39ada3; }
`;

const emojiIcon = (icon: string, ariaLabel: string) => (
    <span className={css({ fontSize: '28px', marginRight: '0.75em' })}
        role="img"
        aria-label={ariaLabel}
    >{icon}</span>
);

const App = () => (
    <Fragment>
        <h1>Kevin Garsjo</h1>
        <h2>Software Engineer</h2>
        <noscript>Enabling javascript is recommended but not required</noscript>
        <p>{emojiIcon('🏢', 'work')}SDE2 at Amazon</p>
        <p>{emojiIcon('🏠', 'home')}{"Living in Portland, OR"}</p>
        <p>{emojiIcon('🎓', 'education')}{"Bachelors of Science, CompSci, University of Oregon"}</p>
        <footer>
            <div><a href="https://github.com/kgarsjo">GitHub</a></div>
            <div><a href="https://www.linkedin.com/in/krgarsjo/">LinkedIn</a></div>
        </footer>
    </Fragment>
);

export default App;