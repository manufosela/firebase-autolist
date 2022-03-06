import { LitElement, html } from 'lit';
import {
  getDatabase,
  ref,
  onValue,
  connectDatabaseEmulator,
  remove
} from 'firebase/database'; // get, child, push, set, update, serverTimestamp,
import { firebaseAutoListStyles } from './firebase-autolist-styles.js';
import '@polymer/paper-spinner/paper-spinner.js';

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
        type: String, reflect: true,
      },
      showId: {
        type: Boolean,
        attribute: 'show-id'
      },
      fieldKey: {
        typer: String,
        attribute: 'field-key'
      },
      valSelected: {
        type: String,
        attribute: 'val-selected'
      },
      selectView: {
        type: Boolean,
        attribute: 'select-view'
      },
      height: {
        type: Number,
        attribute: 'height'
      },
      autoRefresh: {
        type: Boolean,
        attribute: 'auto-refresh'
      },
      showDelete: {
        type: Boolean,
        attribute: 'show-delete'
      },
      search: {
        type: Boolean
      },
      data: {
        type: Object
      },
      userData: {
        type: Object
      },
      loginId: {
        type: String,
        attribute: 'login-id'
      }
    };
  }

  static get styles() {
    return [firebaseAutoListStyles];
  }

  constructor() {
    super();
    this.path = '';
    this.fieldKey = '';
    this.showId = false;
    this.valSelected = '';
    this.search = false;
    this.height = 0;
    this.autoRefresh = false;
    this.showDelete = false;

    this.data = null;
    this.userData = null;
    this.loginId = null;
    this.bLog = false;

    this.firebaseApp = null;
    this.db = null;
    this.userData = null;
    this.userDisplayNameData = null;
    this.emulation = false;

    this.initialized = false;

    this._selectedElement = this._selectedElement.bind(this);
    this._setCssElement = this._setCssElement.bind(this);
    this._deleteElement = this._deleteElement.bind(this);
    this._closeModal = this._closeModal.bind(this);
    this._wcReady = this._wcReady.bind(this);
    this._firebaseLogin = this._firebaseLogin.bind(this);
    this._firebaseLogout = this._firebaseLogout.bind(this);
  }

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('firebase-signin', this._firebaseLogin);
    document.addEventListener('firebase-signout', this._firebaseLogout);
    document.addEventListener('setcss-autolist-element', this._setCssElement);
    const firebaseAreYouLoggedEvent = new CustomEvent('firebase-are-you-logged', {detail: {id: this.id}});
    document.dispatchEvent(firebaseAreYouLoggedEvent);
  }

  disconnectedCallback() {
    document.removeEventListener('firebase-signin', this._isSignIn);
    document.removeEventListener('firebase-signout', this._isSignOut);
    document.removeEventListener('setcss-autolist-element', this._setCssElement);
    document.removeEventListener('click', this._closeModal);
    this.shadowRoot.querySelectorAll('#elements-layer a.element').forEach((el)=> {
      el.removeEventListener('click', this._selectedElement);
    });
    this.shadowRoot.querySelectorAll('#elements-layer a.deleteBtn').forEach((el)=> {
      el.removeEventListener('click', this._deleteElement);
    });
    super.disconnectedCallback();
  }

  updated(changedProperties) {
    changedProperties.forEach((oldValue, propName) => {
      if (propName === 'path' && this.elId !== oldValue && oldValue !== undefined) {
        this.getData();
      }
    });
  }

  firstUpdated() {
    super.firstUpdated();
    this.id = this.id || `firebase-autolist-${Math.random().toString(36).substring(2, 15)}`;
    if (!this.initialized) {
      document.dispatchEvent(
        new CustomEvent('are-it-logged-into-firebase', {
          detail: {
            id: this.loginId,
          },
        })
      );
    }
  }

  consoleLog(msg) {
    if (this.bLog) {
      console.log(msg);
    }
  }

  _firebaseLogin(event) {
    const refId = event.detail.id;
    if (refId === this.loginId) {
      this.initialized = true;
      this.firebaseApp = event.detail.firebaseApp;
      this.db = getDatabase(this.firebaseApp);
      this.userData = event.detail.user;
      if (this.emulation) {
        connectDatabaseEmulator(this.db);
      }
      this.storage = event.detail.firebaseStorage;
      this.consoleLog(
        '_firebaseLogin',
        this.firebaseApp,
        this.db,
        this.userData,
      );
      this._wcReady();
      this.getData();
      return true;
    }
    return false;
  }

  _firebaseLogout() {
    this.firebaseApp = null;
    this.db = null;
    this.userDisplayNameData = null;
  }

  _wcReady() {
    const componentCreatedEvent = new CustomEvent('wc-ready', {
      detail: {
        id: this.id,
        componentName: this.tagName,
        component: this,
      },
    });
    document.dispatchEvent(componentCreatedEvent);
  }

  _setCssElement(ev) {
    if (ev.detail && ev.detail.id === this.id) {
      if (ev.detail.name && ev.detail.style) {
        const selector = ev.detail.name;
        const {style} = ev.detail;
        if (this.shadowRoot.querySelector(selector)) {
          this.shadowRoot.querySelector(selector).style = style;
        }
      }
    }
  }

  processData(snapshot) {
    this.data = snapshot.val();
    if (this.data) {
      this._getData();
    } else {
      this.shadowRoot.querySelector('#elements-layer').innerHTML = 'No data found';
    }
    const firebaseAutolistFinish = new CustomEvent('firebase-autolist-finish', {detail: {id: this.id}});
    document.dispatchEvent(firebaseAutolistFinish);
  }

  getData() {
    if (this.path !== '') {
      const refDb = ref(this.db, this.path);
      const once = (this.autoRefresh) ? {} : { onlyOnce: true }; 
      onValue(refDb, (snapshot) => this.processData(snapshot), once);
    } else {
      this.consoleLog('path not defined');
    }
  }

  deleteIdFromFirebase(id) {
    const path = (this.path[this.path.length - 1] === '/') ? this.path : `${this.path  }/`;
    this.consoleLog(path + id);
    const refDb = ref(this.db, path + id);
    remove(refDb, (error)=> {
      if (error === null) {
        this.getData();
      }
    });
  }

  _userLogged(obj) {
    if (!this.user && obj.detail.user) {
      this.user = obj.detail.user.displayName;
      this.userData = obj.detail.user;
    }
  }

  _userLogout() {
    this.userData = null;
    this.data = null;
  }

  _selectedElement(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    document.dispatchEvent(new CustomEvent('firebase-autolist-selectid', {detail: {id: ev.target.name, objId: this.id, value: ev.target.value}}));
    const arrayLink = this.shadowRoot.querySelectorAll('#elements-layer li a.element');
    for (const link of arrayLink) {
      link.classList.remove('selected');
    }
    ev.target.classList.add('selected');
  }

  _closeModal() {
    const modal = this.shadowRoot.querySelector('#modal-delete-element');
    if (modal) {
      modal.remove();
    }
  }

  _createModal(ev) {
    this._null = null;
    const modal = document.createElement('div');
    modal.id = 'modal-delete-element';
    modal.classList.add('modal');
    modal.style.top = `${ev.clientY  }px`;
    modal.style.left = `${ev.clientX  }px`;
    return modal;
  }

  _deleteElement(ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this._closeModal();
    const field = ev.target.title.replace('delete ', '');
    const {id} = ev.target.dataset;
    const modal = this._createModal(ev);
    modal.innerHTML = `
      <div data-id="${id}">¿Quieres borrar el elemento ${field}?</div>
      <button id="deleteSi">Sí</button><button id="deleteNo">No</button>
    `;
    this.shadowRoot.appendChild(modal);
    document.addEventListener('click', this._closeModal);
    this.shadowRoot.querySelector('#deleteSi').addEventListener('click', () => this.deleteIdFromFirebase(id));
  }

  _getData() {
    this.shadowRoot.querySelector('#elements-layer').innerHTML = '';
    if (this.fieldKey === '') {
      this._getDataKeys();
    } else {
      this._getDataFields();
    }

    this.shadowRoot.querySelectorAll('#elements-layer a.element').forEach((el)=> {
      el.addEventListener('click', this._selectedElement);
    });
    this.shadowRoot.querySelectorAll('#elements-layer a.deleteBtn').forEach((el)=> {
      el.addEventListener('click', this._deleteElement);
    });
    this.shadowRoot.querySelector('#spinner').active = false;
  }

  _getDataFields() {
    const {data} = this;
    if (Array.isArray(data)) {
      data.shift();
      data.forEach((elem, _id) => {
        const id = _id + 1; // Porque eliminamos el elemento 0 que es que se usa de referencia
        this.consoleLog(`${JSON.stringify(elem)}-${id}`);
        const classSelect = (this.valSelected === elem[this.fieldKey]) ? 'class="selected"' : '';
        const liEl = document.createElement('li');
        const deleteBtn = (this.showDelete) ? `<a class="deleteBtn" data-id="${id}" title="delete ${elem[this.fieldKey]}">X</a>` : '';
        liEl.innerHTML = `<a href='#' ${classSelect} class="element" name='${id}'>${(this.showId) ? `[${id}]` : ''} ${elem[this.fieldKey]}</a>${deleteBtn}`;

        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      });
    } else {
      this._getDataKeys(this.fieldKey);
    }
  }

  _getDataKeys(id) {
    const data = (id) ? this.data[id] : this.data;
    const keys = Object.keys(data);
    for (const elem of keys) {
      this.consoleLog(elem);
      if (elem !== '0' || ['string', 'number'].includes(typeof(data[elem]))) {
        const value = ['string', 'number'].includes(typeof(data[elem])) ? data[elem] : elem;
        const liEl = document.createElement('li');
        const classSelect = (this.valSelected === value) ? 'class="element selected"' : '';
        const deleteBtn = (this.showDelete) ? `<a class="deleteBtn" data-id="${elem}" title="delete ${value}">X</a>` : '';
        liEl.innerHTML = `<a href='#' ${classSelect} class="element" name='${elem}'>${value}</a>${deleteBtn}`;
        this.shadowRoot.querySelector('#elements-layer').appendChild(liEl);
      }
    }
  }

  render() {
    const path = this.path.split('/');
    const height = (this.height > 0 && this.height <= 100) ? `height:${  this.height  }vh; overflow-y: scroll; overflow-x: hidden;` : '';
    console.log(this.userData);
    return html`
      ${this.userData !== null ? html` 
        ${this.search ? html`<input type="text" name="search">` : html``}
        ${(this.path !== '') ? html`<h3 class='path'>${path[path.length - 1].replace('/_/g', ' ')} <paper-spinner id="spinner" class="blue" active></paper-spinner></h3>` : html``}
        <div style="${height}">
          <section>
            <ul id="elements-layer">
            </ul>
          </section>
        </div>
      ` : html`<div class="waiting">Waiting for login...</div>`}
    `;
  }
}
