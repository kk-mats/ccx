# 検出ツールプラグイン

検出ツールプラグインとは内部で検出ツールを起動してコードクローンを検出するためのコンポーネントです。CCX には既にいくつかのプラグインが組み込まれていますが、自分で実装して追加することも可能です。

検出ツールプラグインには実行形式の違いから以下の 3 種類に分類されます。
- `image`: 指定された image をダウンロードして実行
- `dockerfile`: 指定された dockerfile から image をビルドして実行
- `command`: 指定されたコマンドから実行

また追加方法の違いから以下の 2 種類に分類されます。
- global プラグイン: `<store-root>/plugins/global/detect/` 以下に保存することで追加
- private プラグイン: Web UI からアップロードすることで追加
global プラグインは `image`、`dockerfile`、`command` の全ての実行形式に対応しますが、private プラグインは `image` にのみ対応します。

# 実装
## `plugin.yml`
`plugin.yml` はそのプラグインが使用する検出ツールの名前、バージョン、検出パラメータの定義を記述します。

| フィールド名 | 機能 |
| ---- | ---- |
| `name` | 検出ツールの名前 |
| `environment` | 検出ツールプラグインが対応する環境と実行形式 |
| `variants` | バージョンごとの検出ツールの定義 |

`environment` フィールドには更に `windows` フィールドおよび `linux` フィールドが存在します。それぞれには Windows 環境および Linux 環境でのプラグインの実行形式を指定します。例えば `environemnt.windows.dockerfile: ./docker/dockerfile` を指定すると Windows 環境においてそのプラグインは `./docker/dockerfile` からイメージをビルドして実行されます。また `environment.linux.command: jave -jar plugin.jar` を指定すると Linux 環境においてそのプラグインは `java -jar plugin.jar` から実行されます。

`variants` フィールドには更に `versions` フィールドおよび `parameters` フィールドが存在します。`versions` フィールドは検出ツールのバージョンを表す文字列の配列で、選択されたバージョンが `versions` フィールドに含まれるときその定義を用います。`parameters` フィールドには検出パラメータの定義を指定します。

## 入力
検出ツールプラグインには引数の末尾に作業用ディレクトリへの絶対パスが与えられます。

```
./plugin arg1 arg2 path/to/<root>
```

この作業用ディレクトリは以下のように構成され、`resources` ディレクトリ内にはパラメータなどが記述された JSON ファイル `query.json` と検出対象のソースコードをまとめた `repo` ディレクトリが存在します.

```
<root>/
  ┗━ resources/
      ┣━ query.json
      ┗━ repo/
          ┣━ <query.targets[0].revision>/
          ┃            ︙
          ┗━ <query.targets[n].revision>/
```

`query.json` は以下のような項目を含みます。
```
{
	"detectorVersion": "1.0", //使用する検出ツールのバージョン
	"targets": [
		{
			"directory": "relative/path/of/target/from/repository/root", // 1 つめのディレクトリパラメータの値
			"revision": "commitHashOfRepository" // 1 つめのリビジョンパラメータの値
		},
		{
			"directory": "relative/path/of/target/from/repository/root", // 2 つめのディレクトリパラメータの値
			"revision": "commitHashOfRepository" // 2 つめのディレクトリパラメータの値
		}
	],
	"parameters": {
		"foo": "fooValue", // key が foo であるパラメータの値
		"bar": 1 // key が bar であるパラメータの値
		"baz": null // key が baz であるパラメータの値
	}
}
```

また, `resources/repo` ディレクトリ内には `query.json` の `targets` に記載された `revision` を名前とするディレクトリが存在します。これらのディレクトリにはその名前のバージョンのソースコードがそれぞれ含まれています。


## 出力
検出結果は全て `artifacts` ディレクトリ内に出力します。CCX は `artifacts` ディレクトリ内に `output` および `0` から始める連番のディレクトリが存在することを期待します。

```
<root>/
  ┣━ resources/
  ┗━ artifacts/
      ┃
      ┣━ 0/
      ┃    ┣━ clones.json
      ┃    ┗━ output/
      ┃        ┣━━ <raw detection report of result 0>
      ┃        ┃            ︙
      ┃        ┗━━ <some cache files of result 0>
      ︙
      ┣━ n/
      ┃    ┣━ clones.json
      ┃    ┗━ output/
      ┃        ┣━━ <raw detection report of result n>
      ┃        ┃            ︙
      ┃        ┗━━ <some cache files of result n>
      ┃
      ┗━ output/
          ┣━━ <raw detection report>
          ┃            ︙
          ┗━━ <some cache files>
```

連番のディレクトリ内にはそれぞれ検出結果を保存します。例えば検出結果を 3 つ出力する場合、0, 1, 2 のディレクトリを作成し、その中にそれぞれ検出結果を保存します。出力する検出結果が 1 だけの場合は 0 ディレクトリのみを作成してください。

検出結果は各連番ディレクトリ内の `query.json` に出力します。
検出結果はクローンペア単位あるいはクローンセット単位で出力できます。

クローンペア単位で出力する場合以下のような形式で、`parameters` フィールドは省略可能です。省略された場合ユーザが指定したパラメータを CCX が自動で追加します。複数の検出結果を出力する場合など、ユーザが指定したものと実際に検出に用いたものが異なる場合 `parameters` に実際に使用したパラメータを出力してください。

```
{
	"parameters": {
		"foo": "fooValue",
		"bar": 1
		"baz": null
	},
	"clonePairs": [
		{
			"f1": {
				"file": "relative/path/to/file1",
				"begin": 1,
				"end": 15
			},
			"f2": {
				"file": "relative/path/to/file2",
				"begin": 1,
				"end": 15
			},
			"similarity": 0.9
		},
		{
			"f1": {
				"file": "relative/path/to/file2",
				"begin": 1,
				"end": 26
			},
			"f1": {
				"file": "relative/path/to/file4",
				"begin": 0,
				"end": 37
			},
			"similarity": 0.7
		}
	]
}
```

クローンセット単位で出力する場合以下のような形式で、クローンペア単位の場合と同様 `parameters` フィールドは省略可能です。
```
{
	"parameters": {
		"foo": "fooValue",
		"bar": 1
		"baz": null
	},
	"cloneSets": [
		{
			"fragments": [
				{
					"file": "relative/path/to/file1",
					"begin": 1,
					"end": 15
				},
				{
					"file": "relative/path/to/file2",
					"begin": 1,
					"end": 15
				},
				{
					"file": "relative/path/to/file2",
					"begin": 19,
					"end": 30
				}
			]
		},
		
		{
			"fragments": [
				{
					"file": "relative/path/to/file1",
					"begin": 11,
					"end": 18
				},
				{
					"file": "relative/path/to/file4",
					"begin": 1,
					"end": 29
				},
				{
					"file": "relative/path/to/file2",
					"begin":9,
					"end": 18
				}
			]
		},
	]
}
```

各連番ディレクトリ直下の `output` ディレクトリにはその検出結果を得る際に出力されたファイルを保存します。`artifacts` ディレクトリ直下の `output` ディレクトリには全体を通して出力されたファイルを保存します。各 `output` ディレクトリに保存されたファイルは Web UI からダウンロードすることが可能になります。

終了コードは以下の通りです。
```
正常: 0
異常: 0 以外
```
