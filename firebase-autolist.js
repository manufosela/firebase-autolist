import { LitElement, html, css } from 'lit-element';
import '@polymer/paper-spinner/paper-spinner.js';
import 'firebase/firebase-app';
import 'firebase/firebase-database';

/**
 * `firebase-autolist`
 * FirebaseAutolist
 *
 * @customElement firebase-autolist
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

export class FirebaseAutolist extends LitElement {
  static get is() {
    return 'firebase-autolist';
  }

  static get properties() {
    return {
      path: {
        type: String
      },
      fieldKey: {
        typer: String,
        attribute: 'field-key'
      },
      data: {
        type: Object
      },
      dataUser: {
        type: Object
      }
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }
      paper-spinner.blue::shadow .circle {
        border-color: var(--spinner-color, #4285f4);
      }
    `;
  }

  constructor() {
    super();
    this.path = '/';
    this.fieldKey = '';

    this.data = null;
    this.dataUser = null;
    this.bLog = false;

    this._isSignIn = this._isSignIn.bind(this);
    this._isSignOut = this._isSignOut.bind(this);
    this._selectedElement = this._selectedElement.bind(this);
  }

  log(msg) {
    if (this.bLog) {
      console.log(msg);
    }
  }

  _isSignIn(ev) {
    this._userLogged(ev);
    this.getData();
  }

  _isSignOut(ev) {
    this._userLogout(ev);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', this._isSignIn);
    document.addEventListener('firebase-signout', this._isSignOut);
    const firebaseAreYouLoggedEvent = new Event('firebase-are-you-logged');
    document.dispatchEvent(firebaseAreYouLoggedEvent);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('firebase-signin', this._isSignIn);
    document.removeEventListener('firebase-signout', this._isSignOut);
    this.shadowRoot.querySelectorAll('#elements-layer a').forEach((el)=> {
      el.removeEventListener('click', this._selectedElement);
    });
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'path' && this.elId !== oldValue && oldValue !== undefined) {
        this.getData();
      }
    });
  }

  getData() {
    let starredStatusRef = firebase.database().ref(this.path);
    starredStatusRef.on('value', (snapshot) => {
      this.data = snapshot.val();
      if (this.data) {
        this._getData();
      } else {
        this.shadowRoot.querySelector('#elements-layer').innerHTML = 'No data found';
      }
    });
  }

  _userLogged(obj) {
    if (!this.user && obj.detail.user) {
      this.user = obj.detail.user.displayName;
      this.dataUser = obj.detail.user;
    }
  }

  _userLogout() {
    this.dataUser = null;
    this.data = null;
  }

  _selectedElement(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    document.dispatchEvent(new CustomEvent('firebase-autolist-selectid', {detail: {id: ev.target.name, objId: this.id}}));
  }

  _getData() {
    this.shadowRoot.querySelector('#elements-layer').innerHTML = '';
    if (this.fieldKey === '') {
      this._getDataKeys();
    } else {
      this._getDataFields();
    }

    this.shadowRoot.querySelectorAll('#elements-layer a').forEach((el)=> {
      el.addEventListener('click', this._selectedElement);
    });
    this.shadowRoot.querySelector('#spinner').active = false;
  }

  _getDataFields() {
    let data = this.data;
    if (Array.isArray(data)) {
      data.shift();
      data.forEach((elem, id) => {
        this.log(JSON.stringify(elem) + ' - ' + id);
        const liEl = document.createElement('li');
        liEl.innerHTML = `<a href='#' name='${id}'>[${id}] ${elem[this.fieldKey]}</a>`;
        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      });
    } else {
      this._getDataKeys(this.fieldKey);
    }
  }

  _getDataKeys(id) {
    let data = (id) ? this.data[id] : this.data;
    let keys = Object.keys(data);
    for (let elem of keys) {
      this.log(elem);
      if (elem !== '0' || ['string', 'number'].includes(typeof(data[elem]))) {
        const value = ['string', 'number'].includes(typeof(data[elem])) ? elem : data[elem];
        const liEl = document.createElement('li');
        liEl.innerHTML = `<a href='#' name='${elem}'>${value}</a>`;
        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      }
    }
  }

  render() {
    return html`
      ${this.dataUser !== null ? html` 
        <h3 class='path'>${this.path.replace(/^\//, '')} <paper-spinner id="spinner" class="blue" active></paper-spinner></h3>
        <div class="container">
          <section>
            <ul id="elements-layer">
            </ul>
          </section>
        </div>
      ` : html`<div class="waiting">Waiting for login...</div>`}
    `;
  }
}

window.customElements.define(FirebaseAutolist.is, FirebaseAutolist);