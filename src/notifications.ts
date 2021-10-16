export { subscribe };

type G4NotificationOptions = {
  endpoint: string;
  tenant: string;
  bearer: string;
  onerror?: (event: Event) => void;
  onclose?: () => void;
  subs: G4Subscriptions;
};

type G4Subscriptions = {
  auth?: {
    auth?: (message: G4AuthAuthMessage) => void;
  };
  session?: {
    create?: (message: G4SessionCreateMessage) => void;
    close?: (message: G4SessionCloseMessage) => void;
    fail?: (message: G4SessionFailMessage) => void;
  };
  user?: {
    create?: (message: G4UserCreateMessage) => void;
    import?: (message: G4UserImportMessage) => void;
    update?: (message: G4UserUpdateMessage) => void;
    archive?: (message: G4UserArchiveMessage) => void;
  };
  document?: {
    load?: (message: G4DocumentLoadMessage) => void;
  };
  collection?: {
    loading?: (message: G4CollectionLoadingMessage) => void;
    loaded?: (message: G4CollectionLoadedMessage) => void;
  };
};

type G4AuthAuthMessage = {
  validCredentials: boolean;
  accessAllowed: boolean;
  username: string;
  host: string;
};

type G4SessionCreateMessage = {
  sessionId: string;
  username: string;
  host: string;
};

type G4SessionCloseMessage = {
  sessionId: string;
  host: string;
};

type G4SessionFailMessage = {
  username: string;
  host: string;
};

type G4UserCreateMessage = {
  username: string;
  id: number;
  host: string;
};

type G4UserImportMessage = {
  username: string;
  id: number;
  host: string;
};

type G4UserArchiveMessage = {
  id: number;
  host: string;
};

type G4UserUpdateMessage = {
  username: string;
  id: number;
  host: string;
};

type G4DocumentLoadMessage = {
  username: string;
  docid: number;
  signature: string;
  doctype: string | null;
  filename: string | null;
  loaded: string | null;
  policies: string[];
  jobid: string | null;
};

type G4CollectionLoadingMessage = {
  count: number;
  name: string;
  title: string;
};

type G4CollectionLoadedMessage = {
  count: number;
  name: string;
  title: string;
};

function subscribe(options: G4NotificationOptions) {
  if (options.endpoint.match(/^[a-z]+$/))
    options.endpoint = `wss://g4n-${options.endpoint}.v1.mrcapi.net`;
  const socket = new WebSocket(options.endpoint);
  if (options.onerror) socket.onerror = options.onerror;
  if (options.onclose) socket.onclose = options.onclose;
  socket.onmessage = (messageEvent: MessageEvent<string>) => {
    const message = JSON.parse(messageEvent.data) as {
      Subject: string;
      Message: string;
    };
    const matches = [
      ...message.Subject.matchAll(/^([A-Z]+):([a-z]+)\.([a-z]+)$/g),
    ];
    if (matches.length !== 0) {
      const [, , className, event] = matches[0];
      dispatchEvent(options.subs, className, event, message.Message);
    }
  };
  socket.onopen = () => {
    socket.send(
      JSON.stringify({
        action: "subscribe",
        tenant: options.tenant,
        events: events(options),
        bearer: options.bearer,
      })
    );
  };
  return () => socket.close();
}

function dispatchEvent(
  subs: G4Subscriptions,
  className: string,
  event: string,
  message: string
) {
  switch (className) {
    case "auth":
      return dispatch_auth(subs, event, message);
    case "session":
      return dispatch_session(subs, event, message);
    case "user":
      return dispatch_user(subs, event, message);
    case "document":
      return dispatch_document(subs, event, message);
    case "collection":
      return dispatch_collection(subs, event, message);
  }
}

function dispatch<T>(message: string, dispatcher?: (message: T) => void) {
  if (dispatcher) dispatcher(JSON.parse(message) as T);
}

function dispatch_auth(subs: G4Subscriptions, event: string, message: string) {
  switch (event) {
    case "auth":
      return dispatch<G4AuthAuthMessage>(message, subs.auth?.auth);
  }
}

function dispatch_session(
  subs: G4Subscriptions,
  event: string,
  message: string
) {
  switch (event) {
    case "create":
      return dispatch<G4SessionCreateMessage>(message, subs.session?.create);
    case "close":
      return dispatch<G4SessionCloseMessage>(message, subs.session?.close);
    case "fail":
      return dispatch<G4SessionFailMessage>(message, subs.session?.fail);
  }
}

function dispatch_user(subs: G4Subscriptions, event: string, message: string) {
  switch (event) {
    case "create":
      return dispatch<G4UserCreateMessage>(message, subs.user?.create);
    case "import":
      return dispatch<G4UserImportMessage>(message, subs.user?.import);
    case "update":
      return dispatch<G4UserUpdateMessage>(message, subs.user?.update);
    case "archive":
      return dispatch<G4UserArchiveMessage>(message, subs.user?.archive);
  }
}

function dispatch_document(
  subs: G4Subscriptions,
  event: string,
  message: string
) {
  switch (event) {
    case "load":
      return dispatch<G4DocumentLoadMessage>(message, subs.document?.load);
  }
}

function dispatch_collection(
  subs: G4Subscriptions,
  event: string,
  message: string
) {
  switch (event) {
    case "loading":
      return dispatch<G4CollectionLoadingMessage>(
        message,
        subs.collection?.loading
      );
    case "loaded":
      return dispatch<G4CollectionLoadedMessage>(
        message,
        subs.collection?.loaded
      );
  }
}

function events(options: G4NotificationOptions) {
  let events: string[] = [];
  for (const [_class, _events] of Object.entries(options.subs)) {
    for (const [_event] of Object.entries(_events)) {
      events.push(`${_class}.${_event}`);
    }
  }
  return events;
}
