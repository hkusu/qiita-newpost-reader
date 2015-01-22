'use strict';

angular.module('qiitaNewpostReader')
  .controller('MainCtrl', function ($scope, $http, $ionicLoading, $ionicModal, $ionicScrollDelegate) {
    $scope.next_page = 1;
    $scope.search_keyword = "";
    $scope.tag_url = "";
    $scope.tag_name = "";
    $scope.user_url = "";
    $scope.message = "";
    $scope.show_infinite = true;
    var api_url = "";
    var PER_PAGE = 20;

    // 初期表示は View の infinite-scroll から呼ばれる
    $scope.load = function(_page, _keyword, _tag_url, _tag_name, _user_url){
      // Loading... を表示
      $ionicLoading.show({
        template: 'Loading...',
        noBackdrop: true
      });
      // 対象APIの決定
      if (_keyword != "") {
        api_url = 'https://qiita.com/api/v1/search?' + 'q=' + _keyword + '&';
      } else if (_tag_url != "") {
        api_url = 'https://qiita.com/api/v1/tags/' + _tag_url + '/items?';
      } else if (_user_url != "") {
        api_url = 'https://qiita.com/api/v1/users/' + _user_url + '/items?';
      } else {
        api_url = 'https://qiita.com/api/v1/items?';
      }
      // APIリクエストを発行
      $http.get(api_url + 'per_page=' + PER_PAGE + '&page=' + _page).success(function(items) {
        // 1ページ目の場合
        if (_page == 1){
          // 表示すべき内容が無い場合はメッセージを表示して終了
          if (items.length == 0) {
            $ionicLoading.show({
              template: '検索に一致する投稿はありません。',
              noBackdrop: true,
              duration: 2000
            });
            return;
          }
          // 内容をクリア
          $scope.items= [];
          // 一覧のスクロールをTOPへ
          $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
        }
        // Loading... を隠す
        $ionicLoading.hide();
        // infinite-scroll 欄の表示/非表示
        $scope.show_infinite = true;
        if (items.length != PER_PAGE) {
          // なぜかタグでの検索は指定した件数が返ってこないので対策
          //$scope.show_infinite = false;
          if (_tag_url == "") {
            $scope.show_infinite = false;
          } else {
            if (items.length == 0) {
              $scope.show_infinite = false;
            }
          }
        }
        // 既存の内容に結合
        $scope.items = $scope.items.concat(items);
        // ページ上部のリフレッシュ表示を終了
        $scope.$broadcast('scroll.refreshComplete');
        // ページ下部の infinite-scroll を終了
        $scope.$broadcast('scroll.infiniteScrollComplete');
        // ページ上部にメッセージを表示
        if (_keyword != "") {
          $scope.message = '"' + _keyword + '"' + ' での検索結果'
        } else if (_tag_url != "") {
          $scope.message = '"' + _tag_name + '"' + ' タグの投稿'
        } else if (_user_url != "") {
          $scope.message = _user_url + ' の投稿'
        } else {
          $scope.message = ""
        }
        // ページ上部のリフレッシュおよび下部の infinite-scroll 向けに view へ値をセット
        $scope.next_page = _page + 1;
        $scope.search_keyword = _keyword;
        $scope.tag_url = _tag_url;
        $scope.tag_name = _tag_name;
        $scope.user_url = _user_url;
      });
    };

    // 検索ボタン
    $scope.doSearch = function(_keyword){
      $scope.load(1, _keyword, '', '', '');
      $scope.search_modal.hide();
    };

    // 記事詳細 モーダル表示
    $scope.modal_body = "";
    $ionicModal.fromTemplateUrl("post.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.post_modal = modal;
    });
    $scope.openPostModal = function(index) {
      // マークダウン(コードハイライトつき)＆絵文字を表示。初期時に値が無いとエラーになるので他の項目とは別途で
      $scope.modal_body = $scope.items[index].raw_body;
      $scope.item = $scope.items[index];
      // モーダルのスクロールをTOPへ。ハンドルを指定して、背後の ScrollView がTOPにスクロールされないようにする
      $ionicScrollDelegate.$getByHandle('subScroll').scrollTop();
      $scope.post_modal.show();
    };
    var displayed = false;
    $scope.closePostModal = function(show_message) {
      // メッセージを表示
      if (show_message && !displayed) {
        $ionicLoading.show({
          template: '画面のどこかをタッチして閉じることもできます。',
          noBackdrop: true,
          duration: 2000
        });
        displayed = true;
      }
      $scope.post_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.post_modal.remove();
    });

    // info モーダル表示
    $ionicModal.fromTemplateUrl("info.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.info_modal = modal;
    });
    $scope.openInfoModal = function() {
      $scope.info_modal.show();
    };
    $scope.closeInfoModal = function() {
      $scope.info_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.info_modal.remove();
    });

    // 検索 モーダル表示
    $ionicModal.fromTemplateUrl("search.modal.html", {
      scope: $scope,
      animation: "slide-in-up"
    }).then(function(modal) {
      $scope.search_modal = modal;
    });
    $scope.openSearchModal = function() {
      $scope.search_modal.show();
    };
    $scope.closeSearchModal = function() {
      $scope.search_modal.hide();
    };
    $scope.$on("$destroy", function() {
      $scope.search_modal.remove();
    });
  });
