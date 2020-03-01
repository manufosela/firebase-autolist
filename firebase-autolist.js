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
  }

  log(msg) {
    if (this.bLog) {
      console.log(msg);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', (ev) => {
      this._userLogged(ev);
      this.getData();
    });
    document.addEventListener('firebase-signout', (ev) => {
      this._userLogout(ev);
    });
    const firebaseAreYouLoggedEvent = new Event('firebase-are-you-logged');
    document.dispatchEvent(firebaseAreYouLoggedEvent);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('firebase-signin', (ev) => {
      this._userLogged(ev);
      this.getData();
    });
    document.removeEventListener('firebase-signout', (ev) => {
      this._userLogout(ev);
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

  _getData() {
    this.shadowRoot.querySelector('#elements-layer').innerHTML = '';
    if (this.fieldKey === '') {
      this._getDataKeys();
    } else {
      this._getDataFields();
    }

    this.shadowRoot.querySelectorAll('#elements-layer a').forEach((el)=> {
      el.addEventListener('click', (ev) => {
        ev.preventDefault();
        ev.stopPropagation();
        document.dispatchEvent(new CustomEvent('firebase-autolist-selectid', {detail: {id: ev.target.name, objId: this.id}}));
      });
    });
    this.shadowRoot.querySelector('#spinner').active = false;
  }

  _getDataFields() {
    let data = this.data;
    if (Array.isArray(data)) {
      data.forEach((elem, id) => {
        this.log(JSON.stringify(elem) + ' - ' + id);
        const liEl = document.createElement('li');
        liEl.innerHTML = `<a href='#' name='${id}'>[${id}] ${elem[this.fieldKey]}</a>`;
        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      });
    } else {
      this._getDataKeys(this.id);
    }
  }

  _getDataKeys(id) {
    let data = (id) ? this.data[id] : this.data;
    let keys = Object.keys(data);
    keys.forEach((elem) => {
      this.log(elem);
      const liEl = document.createElement('li');
      liEl.innerHTML = `<a href='#' name='${elem}'>${elem}</a>`;
      this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
    });
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