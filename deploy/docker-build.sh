cp -r ../config config
cp ../package.json .
cp -r ../src src
cp ../.babelrc .
cp ../.eslintignore .
cp ../.eslintrc .

docker build -t $1 .
