
## [2026.6.0](https://github.com/AlexDevsTheWeb/myfinance/compare/v2026.5.0...v2026.6.0) (2026-06-22)


* add dedicated branch-strategy wiki page ([fc331f0](https://github.com/AlexDevsTheWeb/myfinance/commit/fc331f0204885bc51f9149b352bd58d5a575d8b1))
* add design spec for transaction layout improvement (YATF-80) ([84f63fe](https://github.com/AlexDevsTheWeb/myfinance/commit/84f63fe13789b6db80d669004202a7ce1239a8d0))
* add LLM Wiki for persistent project knowledge base ([687ada0](https://github.com/AlexDevsTheWeb/myfinance/commit/687ada0555dba55f03cd0650218e5936d1e57cab))
* make pie chart height dynamic to prevent legend clipping (YATF-80) ([5d5098b](https://github.com/AlexDevsTheWeb/myfinance/commit/5d5098b3cf84d21ce356e13cf1d1e74206321e3d))
* restrict PR preview deploys to main-only; document CI/CD and versioning ([0d7f518](https://github.com/AlexDevsTheWeb/myfinance/commit/0d7f5182e53cb37cd7ff5221831550f0390274e4))
* restructure transactions page into two-column layout (YATF-80) ([63fca9f](https://github.com/AlexDevsTheWeb/myfinance/commit/63fca9f960de44e6bbac3ea8524dc312e455199f))

## [2026.5.0](https://github.com/AlexDevsTheWeb/myfinance/compare/v2026.4.2...v2026.5.0) (2026-05-23)


* add adapterLocale to DatePicker and remove redundant LocalizationProvider wrappers ([382e1c6](https://github.com/AlexDevsTheWeb/myfinance/commit/382e1c6662ee26427827bb1f6f442b8ce28be8df))
* add analytics charts design spec and implementation plan ([b1932e5](https://github.com/AlexDevsTheWeb/myfinance/commit/b1932e5d48fd13d5c3239130a46b83ca1e5c157d))
* add implementation plans for branches 2-4 ([16f1f49](https://github.com/AlexDevsTheWeb/myfinance/commit/16f1f499bd587f04544843428fffdaaa571df264))
* add Insights page with all analytics charts ([#37](https://github.com/AlexDevsTheWeb/myfinance/issues/37)) ([da3dbda](https://github.com/AlexDevsTheWeb/myfinance/commit/da3dbda99e4d0e932c19999782b7741f556be3c8))
* add net worth/account charts to dashboard and spending pie to transactions ([#37](https://github.com/AlexDevsTheWeb/myfinance/issues/37)) ([f426a51](https://github.com/AlexDevsTheWeb/myfinance/commit/f426a51d61f507fea05e814f7e9891e4648abbd8))
* add shared analytics layer with hooks and chart components ([#37](https://github.com/AlexDevsTheWeb/myfinance/issues/37)) ([6e63a83](https://github.com/AlexDevsTheWeb/myfinance/commit/6e63a83e6cbf57648bbb6a68039536a81491c517))
* add spending insights charts to Analysis page ([#37](https://github.com/AlexDevsTheWeb/myfinance/issues/37)) ([a9495ef](https://github.com/AlexDevsTheWeb/myfinance/commit/a9495ef98dd1b8b150f28c202ae81ec518632c44))
* **analysis:** add spending insights charts to Analysis page ([15a0147](https://github.com/AlexDevsTheWeb/myfinance/commit/15a0147c0ad4fbcd3f4287aa4f7787b0cd07fe05))
* **analytics:** add AccountBreakdownChart component ([cbd7e55](https://github.com/AlexDevsTheWeb/myfinance/commit/cbd7e5528a89b4bffc0a2d3c9260a3ec1a7da3cb))
* **analytics:** add analytics types ([6afb089](https://github.com/AlexDevsTheWeb/myfinance/commit/6afb089171292282372d208fe93c82a37e1f2a42))
* **analytics:** add AnalyticsFilters component ([14c2c9a](https://github.com/AlexDevsTheWeb/myfinance/commit/14c2c9ac21e60e8009276395b37326b5033f664a))
* **analytics:** add barrel exports, fix tooltip formatter types ([6d93ccf](https://github.com/AlexDevsTheWeb/myfinance/commit/6d93ccf2386948c102f9df145fa8d4e0e90b93ff))
* **analytics:** add CategoryBarChart component ([bc5dd72](https://github.com/AlexDevsTheWeb/myfinance/commit/bc5dd72a0487b0dadc7c9a225b7bcfc707232e58))
* **analytics:** add CategoryPieChart component ([d33594b](https://github.com/AlexDevsTheWeb/myfinance/commit/d33594b42b8ee2bf4f90bffdb64902c93b14caaf))
* **analytics:** add MonthlyComparisonChart component ([65fea90](https://github.com/AlexDevsTheWeb/myfinance/commit/65fea90d696c131d065c7c3bedec4b6af905ba29))
* **analytics:** add NetWorthChart component ([59446df](https://github.com/AlexDevsTheWeb/myfinance/commit/59446df792214c4cec3853aa29c5013157bc21e0))
* **analytics:** add useAccountBreakdown hook ([f06ae97](https://github.com/AlexDevsTheWeb/myfinance/commit/f06ae97c890d362f5393564bdb686c44432ea28e))
* **analytics:** add useCategoryBreakdown hook ([dedc076](https://github.com/AlexDevsTheWeb/myfinance/commit/dedc076abd400d676c8899d9844dbb14cf9fc237))
* **analytics:** add useMonthlyComparison hook ([d9fa8e1](https://github.com/AlexDevsTheWeb/myfinance/commit/d9fa8e1bc33ef826d7e0796795b3e7aaf25b7b8d))
* **analytics:** add useNetWorth hook ([da44a5d](https://github.com/AlexDevsTheWeb/myfinance/commit/da44a5ded931cbfdc4377987b611331467f0a1f6))
* **analytics:** fix net worth monthly filter using cursor instead of start ([838b1ab](https://github.com/AlexDevsTheWeb/myfinance/commit/838b1ab07096ff4bb0acb9160bab1d1c77b60ce9))
* **analytics:** remove unused categories dep, use const for filtered ([6928f53](https://github.com/AlexDevsTheWeb/myfinance/commit/6928f532cbbcbc7350f5632c6c31d33ebb36f9f7))
* **analytics:** rename interfaces with I prefix per codebase convention ([c135d16](https://github.com/AlexDevsTheWeb/myfinance/commit/c135d1656771f1f916a62061a673ec9f0c0888ae))
* compact chart layouts — 3 per row on Insights, side-by-side on Dashboard ([4fb99bd](https://github.com/AlexDevsTheWeb/myfinance/commit/4fb99bd04791ac2fc6eab10bd15a01de3eb0769d))
* **dashboard:** add net worth and account breakdown charts ([a86eff6](https://github.com/AlexDevsTheWeb/myfinance/commit/a86eff6a0eb9fb2b1d9861b5d496bfe8484f091c))
* don't import dayjs/en locale — it clobbers localizedFormat plugin's formats ([d4bb772](https://github.com/AlexDevsTheWeb/myfinance/commit/d4bb7725f46bbecb9b39a4ed44cb604ab0efa561))
* **insights:** add /insights route ([831328a](https://github.com/AlexDevsTheWeb/myfinance/commit/831328af3f469da5eb7e8014bd39f96742fdcb8b))
* **insights:** add Insights nav link to drawer and dropdown ([94bcd99](https://github.com/AlexDevsTheWeb/myfinance/commit/94bcd9906c633d1bc0d4790f14622f069f7d4630))
* **insights:** add Insights page with all analytics charts ([a6d3943](https://github.com/AlexDevsTheWeb/myfinance/commit/a6d3943c1dfefe3f99850a129a44135c312bed7a))
* merge Analysis page into Insights, remove duplicate charts ([e04fda5](https://github.com/AlexDevsTheWeb/myfinance/commit/e04fda5df73abcdab771bff2e613a3d98ff662f9))
* put net worth and account breakdown on same row ([2e13593](https://github.com/AlexDevsTheWeb/myfinance/commit/2e135934b1b52a38861442ea7019a7c19e23ed39))
* **transactions:** add spending pie chart sidebar ([a88685f](https://github.com/AlexDevsTheWeb/myfinance/commit/a88685f0b820f2a5c3f3a95f7503041ce7b984d6))
* two-column layout for Insights page — tables left, charts right ([bd6bbf6](https://github.com/AlexDevsTheWeb/myfinance/commit/bd6bbf66399f3f7d764b0713ed51807888f1e40b))

### [2026.4.2](https://github.com/AlexDevsTheWeb/myfinance/compare/v2026.4.1...v2026.4.2) (2026-05-17)


* **ci:** version bump workflow now handles Firebase deployment to avoid race condition ([75417ac](https://github.com/AlexDevsTheWeb/myfinance/commit/75417ac58ae190e4e48c741c3f67ab46d8821a8a))

### [2026.4.1](https://github.com/AlexDevsTheWeb/myfinance/compare/v2026.4.0...v2026.4.1) (2026-05-17)


* **build:** ignore version.ts so it's regenerated on each build ([021c780](https://github.com/AlexDevsTheWeb/myfinance/commit/021c78015b7be8c61c2c985251af17f883d2ce15))
* **ci:** match conventional commits with scope like fix(build): ([087cd7c](https://github.com/AlexDevsTheWeb/myfinance/commit/087cd7c6cc0502dd871d4289624daea4d907d62a))

## [2026.4.0](https://github.com/AlexDevsTheWeb/myfinance/compare/v2026.3.0...v2026.4.0) (2026-05-17)


* **ci:** get latest tag for release creation ([c3aae1e](https://github.com/AlexDevsTheWeb/myfinance/commit/c3aae1e798d20c4021df537668971080185fa39a))
* **ci:** use full refspec for main branch push ([d5ab717](https://github.com/AlexDevsTheWeb/myfinance/commit/d5ab717d7f7a5e243ca3196aa72879e729288517))
* test version bump release creation ([2b8ee5d](https://github.com/AlexDevsTheWeb/myfinance/commit/2b8ee5df97beb40c13d86a072ad579c89a4d1d14))

## [2026.3.0](https://github.com/AlexDevsTheWeb/myfinance/compare/v2026.2.1...v2026.3.0) (2026-05-17)


* **46-massive-store-refactor:** first extraction of defaults ([b329a0e](https://github.com/AlexDevsTheWeb/myfinance/commit/b329a0ecc2297ad61dbe7f6392f56179bc9a0b80))
* **46-massive-store-refactor:** more improvements ([abcd4a9](https://github.com/AlexDevsTheWeb/myfinance/commit/abcd4a9693bd28beacc1d0b72313b2b48f00b59d))
* **46-massive-store-refactor:** started store refactoring ([46471ba](https://github.com/AlexDevsTheWeb/myfinance/commit/46471baff6bb5ed04d2c18294f3fc7dd80100a6a))
* **46:** complete store refactor - extraction + bug fixes ([2ed3298](https://github.com/AlexDevsTheWeb/myfinance/commit/2ed329804d0adc43752989606ec93120eeecc301))
* add store refactor design spec ([435f8e0](https://github.com/AlexDevsTheWeb/myfinance/commit/435f8e00a0fee8b94387f41f79003e98903c27ff))
* add store refactor implementation plan ([1d52816](https://github.com/AlexDevsTheWeb/myfinance/commit/1d5281657807b3b2a17cb0f25fd9eadcecc12a22))
* **ci:** add contents write permission for version bump push ([be3d6e1](https://github.com/AlexDevsTheWeb/myfinance/commit/be3d6e1038ccf842be85b6760084a3bbd680c140))
* **ci:** configure git user in version-bump workflow ([dd4325c](https://github.com/AlexDevsTheWeb/myfinance/commit/dd4325ca8529d2138c2b38570dc857531a7fa2ea))
* **ci:** use push trigger on main with conventional commit check ([354047b](https://github.com/AlexDevsTheWeb/myfinance/commit/354047b86294d319e6f0c59d1de4f36e09735153))
* **ci:** version bump runs on PR to main instead of development ([3620c1d](https://github.com/AlexDevsTheWeb/myfinance/commit/3620c1d85d740609c08d5e0d005ffcf020b94bc0))
* **deps:** upgrade to MUI v9 - migrate deprecated props to slotProps ([749a415](https://github.com/AlexDevsTheWeb/myfinance/commit/749a41532ab76b2beb40067728b829f83edf9cf8))
* **development:** fix build pipeline ([5229ab4](https://github.com/AlexDevsTheWeb/myfinance/commit/5229ab4a2bef76a44890aca8f3c0e8960c0c3a3c))
* **development:** fixing errors on version bump and build ([3274901](https://github.com/AlexDevsTheWeb/myfinance/commit/3274901171910f3959e3dc02cede60694844a55f))
* extract types to src/store/types/ ([895ddc2](https://github.com/AlexDevsTheWeb/myfinance/commit/895ddc22b7b0f7006eb8a3f08aa92dc51bb49e84))
* extract types to src/store/types/ ([858bbea](https://github.com/AlexDevsTheWeb/myfinance/commit/858bbea97bffcc24d65d05ec71a661729943e82d))
* **locales:** remove duplicate keys from en.json ([5c74946](https://github.com/AlexDevsTheWeb/myfinance/commit/5c74946317f7f6318332936448656df0e1434570))
* map existing codebase ([a759c6a](https://github.com/AlexDevsTheWeb/myfinance/commit/a759c6aaf56ff7e231b256d4d5ed855ea8bea565))
* move validation to separate folder ([3ba9d15](https://github.com/AlexDevsTheWeb/myfinance/commit/3ba9d15b41d6763d762d78ef1290d60ec49fd54a))
