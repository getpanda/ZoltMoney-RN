module.exports = {
  dependencies: {
    'react-native-appsflyer': {
      platforms: {
        android: {
          packageImportPath:
            'import com.appsflyer.reactnative.RNAppsFlyerPackage;',
          packageInstance: 'new RNAppsFlyerPackage()',
        },
      },
    },
  },
};
