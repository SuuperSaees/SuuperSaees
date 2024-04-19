# CMS/Keystatic - @kit/keystatic

Implementation of the CMS layer using the Keystatic library.

This implementation is used when the host app's environment variable is set as:

```
CMS_CLIENT=keystatic
KEYSTATIC_PATH=content
```

Additionally, the following environment variables may be required:

```
KEYSTATIC_PATH=local # local, cloud, github
```

You can also use Keystatic Cloud or GitHub as the storage kind as remote storage.

If `KEYSTATIC_STORAGE_KIND` is set to `cloud`, the following environment variables are required:

```
KEYSTATIC_STORAGE_PROJECT=project-id
```

If `KEYSTATIC_STORAGE_KIND` is set to `github`, the following environment variables are required:

```
KEYSTATIC_STORAGE_REPO=repo-name
KEYSTATIC_STORAGE_BRANCH_PREFIX=branch-prefix
```

GitHub mode requires the installation of a GitHub app.

Please refer to the [Keystatic documentation](https://keystatic.com/docs/github-model) for more information.