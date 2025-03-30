import React, { useEffect, useRef } from 'react';
import RootSiblings from 'react-native-root-siblings';
import ToastContainer, { positions, durations } from './ToastContainer';

const Toast = (props: any) => {
  const toastRef = useRef<RootSiblings | null>(null);

  useEffect(() => {
    toastRef.current = new RootSiblings(<ToastContainer {...props} duration={0} />);

    return () => {
      toastRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    toastRef.current?.update(<ToastContainer {...props} duration={0} />);
  }, [props]);

  return null;
};

Toast.displayName = 'Toast';
Toast.propTypes = ToastContainer.propTypes;
Toast.positions = positions;
Toast.durations = durations;

Toast.show = (
  message: React.ReactNode,
  options: any = { position: positions.BOTTOM, duration: durations.SHORT }
): RootSiblings => {
  let instance: RootSiblings | null = null;

  const onHidden = () => {
    options.onHidden && options.onHidden();
    instance?.destroy();
  };

  instance = new RootSiblings(
    (
      <ToastContainer {...options} onHidden={onHidden} visible={true}>
        {message}
      </ToastContainer>
    )
  );

  return instance;
};

Toast.hide = (toast: RootSiblings) => {
  if (toast instanceof RootSiblings) {
    toast.destroy();
  } else {
    console.warn(
      `Toast.hide expected a \`RootSiblings\` instance as argument.\nBut got \`${typeof toast}\` instead.`
    );
  }
};

export { RootSiblings as Manager };
export default Toast;
